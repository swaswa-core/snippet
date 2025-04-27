'use client';

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchFilterSectionProps {
    searchQuery: string;
    filterTag: string | null;
    allTags: string[];
    setSearchQuery: (value: string) => void;
    handleTagFilter: (tag: string) => void;
}

export function SearchFilterSection({
                                        searchQuery,
                                        filterTag,
                                        allTags,
                                        setSearchQuery,
                                        handleTagFilter
                                    }: SearchFilterSectionProps) {
    return (
        <div className="p-4 border-b bg-white">
            <div className="max-w-full mx-auto">
                <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search snippets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-4 w-full"
                    />
                </div>

                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pb-1">
                        {allTags.map(tag => (
                            <Badge
                                key={tag}
                                variant={filterTag === tag ? "default" : "outline"}
                                className="cursor-pointer text-xs"
                                onClick={() => handleTagFilter(tag)}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}