import { TreeItem } from "@/types";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger, SidebarGroupLabel, SidebarGroup, SidebarGroupContent, SidebarMenuSub, SidebarRail } from "@/components/ui/sidebar"
import { ChevronDownIcon, FileIcon, FolderIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface TreeViewProps {
    data: TreeItem[];
    value?: string | null;
    onValueChange: (value: string) => void;
}

export const TreeView = ({ data, value, onValueChange }: TreeViewProps) => {
    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className="w-full">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu role="tree" aria-label="File explorer">
                                {data.map((item, index) => (
                                    <Tree
                                        key={index}
                                        item={item}
                                        selectedValue={value}
                                        onSelectValue={onValueChange}
                                        parentValue=""
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
            </Sidebar>
        </SidebarProvider>
    );
};

interface TreeProps {
    item: TreeItem;
    selectedValue?: string | null;
    onSelectValue?: (value: string) => void;
    parentValue: string;
}

const Tree = ({ item, selectedValue, onSelectValue, parentValue }: TreeProps) => {
    const [name, ...items] = Array.isArray(item) ? item : [item];
    const currentPath = parentValue ? `${parentValue}/${name}` : name;
    const [isOpen, setIsOpen] = useState(true);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (!items.length) {
                    onSelectValue?.(currentPath);
                } else {
                    setIsOpen(!isOpen);
                }
                break;
            case 'ArrowRight':
                if (items.length && !isOpen) {
                    event.preventDefault();
                    setIsOpen(true);
                }
                break;
            case 'ArrowLeft':
                if (items.length && isOpen) {
                    event.preventDefault();
                    setIsOpen(false);
                }
                break;
        }
    };

    if (!items.length) {
        const isSelected = selectedValue === currentPath;

        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={isSelected}
                    className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                    onClick={() => onSelectValue?.(currentPath)}
                    onKeyDown={handleKeyDown}
                    role="treeitem"
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                >
                    <FileIcon className="size-4" />
                    <span className="truncate">{name}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <Collapsible 
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90" 
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                        className="w-full justify-start"
                        onKeyDown={handleKeyDown}
                        role="treeitem"
                        tabIndex={-1}
                    >
                        <ChevronDownIcon className="size-4 transition-transform" />
                        <FolderIcon className="size-4" />
                        <span className="truncate">{name}</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub role="group" aria-label={`${name} folder contents`}>
                        {items.map((item, index) => (
                            <Tree
                                key={index}
                                item={item}
                                selectedValue={selectedValue}
                                onSelectValue={onSelectValue}
                                parentValue={currentPath}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
};