'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Snippet } from "@/types/snippet";
import { extractUniqueTags, organizeSnippets } from "@/lib/snippet-util";
import { IconCode, IconLanguage, IconPin, IconTags, IconActivity, IconTrendingUp } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [recentSnippets, setRecentSnippets] = useState<Snippet[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        pinned: 0,
        languages: 0,
        tags: 0,
    });

    // Fetch snippets for the dashboard
    useEffect(() => {
        const fetchSnippets = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/snippets');
                if (!response.ok) throw new Error('Failed to fetch snippets');

                const data = await response.json();
                setSnippets(data);

                // Get recent snippets (last 5)
                const sorted = [...data].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setRecentSnippets(sorted.slice(0, 5));

                // Calculate stats
                const tags = extractUniqueTags(data);
                // @ts-ignore
                const languages = new Set(data.map(s => s.language || 'text')).size;
                // @ts-ignore
                const pinned = data.filter(s => s.isPinned).length;

                setStats({
                    total: data.length,
                    pinned,
                    languages,
                    tags: tags.length,
                });

            } catch (error) {
                console.error("Error fetching snippets:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSnippets();
    }, []);

    // Calculate language distribution
    const languageDistribution = snippets.reduce((acc: Record<string, number>, snippet: Snippet) => {
        const lang = snippet.language || 'text';
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Get top languages
    const topLanguages = Object.entries(languageDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Calculate max for scaling
    const maxLangCount = topLanguages.length > 0 ? topLanguages[0][1] : 0;

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <Link href="/snippets">
                    <Button variant="outline" className="ml-auto gap-1">
                        <IconCode size={16} />
                        View All Snippets
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Snippets</CardTitle>
                        <IconCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isLoading ? "Loading..." : `${recentSnippets.length} added recently`}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pinned Snippets</CardTitle>
                        <IconPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pinned}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isLoading ? "Loading..." : `${Math.round((stats.pinned / stats.total) * 100) || 0}% of total`}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Languages</CardTitle>
                        <IconLanguage className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.languages}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isLoading ? "Loading..." : (topLanguages[0]?.[0] || "None") + " is most used"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tags</CardTitle>
                        <IconTags className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.tags}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isLoading ? "Loading..." : `Used across ${stats.total} snippets`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Dashboard Tabs */}
            <Tabs defaultValue="recent" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="recent">Recent Snippets</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Recent Snippets Tab */}
                <TabsContent value="recent" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recently Added</CardTitle>
                            <CardDescription>
                                Your 5 most recently added code snippets
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {isLoading ? (
                                <div className="text-center py-4 text-muted-foreground">Loading snippets...</div>
                            ) : recentSnippets.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">No snippets found</div>
                            ) : (
                                <div className="space-y-2">
                                    {recentSnippets.map((snippet) => (
                                        <div
                                            key={snippet.id}
                                            className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
                                            onClick={() => {
                                                // Could add a function to view snippet details
                                                window.location.href = `/snippets?id=${snippet.id}`;
                                            }}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="font-medium">{snippet.name}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {snippet.language || "text"}
                                                    </Badge>
                                                    {snippet.tags.length > 0 && (
                                                        <span className="flex items-center gap-1">
                              <IconTags size={12} />
                                                            {snippet.tags.length}
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(snippet.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Link href="/snippets" className="w-full">
                                <Button variant="outline" className="w-full">View All Snippets</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Language Distribution</CardTitle>
                            <CardDescription>
                                Breakdown of languages in your snippet collection
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-4 text-muted-foreground">Loading analytics...</div>
                            ) : topLanguages.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">No data available</div>
                            ) : (
                                <div className="space-y-4">
                                    {topLanguages.map(([language, count]) => (
                                        <div key={language} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium">{language}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {count} ({Math.round((count / stats.total) * 100)}%)
                                                </div>
                                            </div>
                                            <Progress value={(count / maxLangCount) * 100} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <div className="text-xs text-muted-foreground">
                                Based on {stats.total} total snippets
                            </div>
                            <Link href="/snippets">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    <IconActivity size={14} />
                                    Details
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Overview</CardTitle>
                            <CardDescription>
                                Your snippet creation activity
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1">
                                    <div className="text-xl font-bold">{recentSnippets.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Snippets created recently
                                    </p>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="text-xl font-bold">{stats.pinned}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Important snippets pinned
                                    </p>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="text-xl font-bold">{stats.languages}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Different languages used
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <IconTrendingUp className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-xs text-muted-foreground">
                Analytics based on your snippet collection
              </span>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}