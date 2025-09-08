"use client"

import { Autocomplete } from "@/lib/Autocomplete_B/Autocomplete";
import {
    QueryClient,
    QueryClientProvider,
    useQueryClient,
} from "@tanstack/react-query"
import { useCallback } from "react";


const todos = [
    {
        id: "1",
        name: "Foo"
    },
    {
        id: "2",
        name: "Food"
    },
    {
        id: "3",
        name: "Bar"
    }
]

async function search(searchTerm: string): Promise<{
    items: {
        id: string;
        text: string;
    }[];
    pageMeta: {
        totalResults: number;
        pageNumber: number;
        resultsPerPage: number;
    }
}> {

    await new Promise((resolve) => setTimeout(resolve, 500));
    const filteredTodos = todos
        .filter(todo => todo.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(todo => ({ id: todo.id, text: todo.name }));

    return {
        items: filteredTodos,
        pageMeta: {
            totalResults: filteredTodos.length,
            pageNumber: 1,
            resultsPerPage: 20
        }
    }
}


function useSearchFn() {
    const qc = useQueryClient();
    return useCallback(async (searchTerm: string) => {
        return qc.ensureQueryData({ queryKey: ['search', searchTerm], queryFn: () => search(searchTerm) });
    }, []);
}

const queryClient = new QueryClient()


function DemoInner() {
    const queryClient = useQueryClient()


    const searchFn = useSearchFn();


    return <Autocomplete
        searchFn={searchFn}
        renderItem={(v: { id: string, text: string }) => {
            return <div>{v.text}</div>
        }}
        itemKey="id" />
}

export function Demo() {
    return <QueryClientProvider client={queryClient}>
        <div style={{ height: 500 }}>
            <DemoInner />
        </div>
    </QueryClientProvider>

}