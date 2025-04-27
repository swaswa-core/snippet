'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Command, 
    CommandInput, 
    CommandList, 
    CommandEmpty, 
    CommandGroup, 
    CommandItem 
} from '@/components/ui/command';
import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckIcon, FilterIcon, SearchIcon, XIcon, PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedSearchProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterTag: string | null;
    setFilterTag: (tag: string | null) => void;
    allTags: string[];
    languageFilter: string | null;
    setLanguageFilter: (language: string | null) => void;
    allLanguages: string[];
    dateRange: { from: Date | null; to: Date | null } | null;
    setDateRange: (range: { from: Date | null; to: Date | null } | null) => void;
    showPinnedOnly: boolean;
    setShowPinnedOnly: (show: boolean) => void;
}

export function AdvancedSearch({
    searchQuery,
    setSearchQuery,
    filterTag,
    setFilterTag,
    allTags,
    languageFilter,
    setLanguageFilter,
    allLanguages,
    dateRange,
    setDateRange,
    showPinnedOnly,
    setShowPinnedOnly
}: AdvancedSearchProps) {
    const [commandOpen, setCommandOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    
    // Update active filters when filters change
    useEffect(() => {
        const filters: string[] = [];
        if (filterTag) filters.push(`Tag: ${filterTag}`);
        if (languageFilter) filters.push(`Language: ${languageFilter}`);
        if (dateRange?.from || dateRange?.to) {
            const fromStr = dateRange.from ? new Date(dateRange.from).toLocaleDateString() : 'Any';
            const toStr = dateRange.to ? new Date(dateRange.to).toLocaleDateString() : 'Any';
            filters.push(`Date: ${fromStr} to ${toStr}`);
        }
        if (showPinnedOnly) filters.push('Pinned only');
        
        setActiveFilters(filters);
    }, [filterTag, languageFilter, dateRange, showPinnedOnly]);
    
    const handleRemoveFilter = (filter: string) => {
        if (filter.startsWith('Tag:')) setFilterTag(null);
        else if (filter.startsWith('Language:')) setLanguageFilter(null);
        else if (filter.startsWith('Date:')) setDateRange(null);
        else if (filter === 'Pinned only') setShowPinnedOnly(false);
    };
    
    return (
        <div className="space-y-2">
            <div className="relative flex items-center w-full">
                <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search snippets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-12"
                />
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 h-7 w-7 px-0"
                    onClick={() => setCommandOpen(true)}
                >
                    <kbd className="pointer-events-none h-5 select-none rounded border bg-muted px-1.5 text-xs font-medium opacity-100">
                        <span className="text-xs">⌘K</span>
                    </kbd>
                </Button>
                
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="ml-2 h-9 w-9 shrink-0"
                            aria-label="Filter"
                        >
                            <FilterIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-4" align="end">
                        <div className="space-y-4">
                            <h4 className="font-medium">Filters</h4>
                            
                            {/* Tags */}
                            <div className="space-y-2">
                                <Label>Tag</Label>
                                <Command className="rounded-lg border shadow-md">
                                    <CommandInput placeholder="Search tags..." />
                                    <CommandList>
                                        <CommandEmpty>No tags found.</CommandEmpty>
                                        <CommandGroup>
                                            {allTags.map(tag => (
                                                <CommandItem
                                                    key={tag}
                                                    value={tag}
                                                    onSelect={() => setFilterTag(tag === filterTag ? null : tag)}
                                                >
                                                    <div className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                        filterTag === tag ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                    )}>
                                                        <CheckIcon className="h-4 w-4" />
                                                    </div>
                                                    {tag}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </div>
                            
                            {/* Languages */}
                            <div className="space-y-2">
                                <Label>Language</Label>
                                <Command className="rounded-lg border shadow-md">
                                    <CommandInput placeholder="Search languages..." />
                                    <CommandList>
                                        <CommandEmpty>No languages found.</CommandEmpty>
                                        <CommandGroup>
                                            {allLanguages.map(language => (
                                                <CommandItem
                                                    key={language}
                                                    value={language}
                                                    onSelect={() => setLanguageFilter(language === languageFilter ? null : language)}
                                                >
                                                    <div className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                        languageFilter === language ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                    )}>
                                                        <CheckIcon className="h-4 w-4" />
                                                    </div>
                                                    {language}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </div>
                            
                            {/* Pinned checkbox */}
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="pinned-only" 
                                    checked={showPinnedOnly}
                                    onCheckedChange={(checked) => setShowPinnedOnly(checked as boolean)}
                                />
                                <Label htmlFor="pinned-only" className="text-sm font-normal">
                                    Show pinned only
                                </Label>
                            </div>
                            
                            <Button 
                                variant="secondary" 
                                className="w-full text-xs" 
                                onClick={() => setFilterOpen(false)}
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            
            {/* Active filters display */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {activeFilters.map((filter, i) => (
                        <Badge key={i} variant="secondary" className="flex items-center gap-1 text-xs">
                            {filter}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-3 w-3 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleRemoveFilter(filter)}
                            >
                                <XIcon className="h-2 w-2" />
                                <span className="sr-only">Remove {filter} filter</span>
                            </Button>
                        </Badge>
                    ))}
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-xs"
                        onClick={() => {
                            setFilterTag(null);
                            setLanguageFilter(null);
                            setDateRange(null);
                            setShowPinnedOnly(false);
                        }}
                    >
                        Clear all
                    </Button>
                </div>
            )}
            
            {/* Global command menu */}
            <Command
                className={cn(
                    "fixed inset-0 z-50 w-full max-w-lg rounded-xl border shadow-md overflow-hidden transition-opacity bg-popover animate-in fade-in",
                    !commandOpen && "animate-out fade-out"
                )}
                style={{ 
                    top: commandOpen ? '20%' : '-100%', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    opacity: commandOpen ? 1 : 0,
                    pointerEvents: commandOpen ? 'auto' : 'none',
                }}
            >
                <CommandInput 
                    placeholder="Type a command or search..." 
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            setCommandOpen(false);
                        }
                    }}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => {
                            setShowPinnedOnly(true);
                            setCommandOpen(false);
                        }}>
                            <FilterIcon className="mr-2 h-4 w-4" />
                            <span>Show pinned snippets</span>
                        </CommandItem>
                        <CommandItem onSelect={() => {
                            // Clear all filters
                            setFilterTag(null);
                            setLanguageFilter(null);
                            setDateRange(null);
                            setShowPinnedOnly(false);
                            setCommandOpen(false);
                        }}>
                            <XIcon className="mr-2 h-4 w-4" />
                            <span>Clear all filters</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Tags">
                        {allTags.slice(0, 5).map(tag => (
                            <CommandItem 
                                key={tag}
                                onSelect={() => {
                                    setFilterTag(tag);
                                    setCommandOpen(false);
                                }}
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                <span>Filter by "{tag}"</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandGroup heading="Languages">
                        {allLanguages.slice(0, 5).map(language => (
                            <CommandItem 
                                key={language}
                                onSelect={() => {
                                    setLanguageFilter(language);
                                    setCommandOpen(false);
                                }}
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                <span>Filter by {language}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
        </div>
    );
}