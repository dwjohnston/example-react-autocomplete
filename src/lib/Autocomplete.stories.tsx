import React from 'react';
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { MyComponent } from './MyComponent';
import { Autocomplete } from './Autocomplete';

const meta = {
    
    component: Autocomplete,
    decorators: [
        (Story) => {
            return <div style={{  height: 500, border: "solid 1px red"}}>
                    <Story/>
                </div>
        }
    ]
} satisfies Meta<typeof Autocomplete<Todo, "id">>;

export default meta;
type Story = StoryObj<typeof meta>;


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


type Todo = {
    id: string; 
    name: string;
}

async function searchFn (searchTerm: string, pageNumber: number) {
    

    let result: Array<Todo> = [];
    if(searchTerm.length <3){
        result = []; 
    }
    else {
        result = todos.filter((v) => v.name.startsWith(searchTerm));
    }
    



    return {
        items: result, 
        pageMeta: {
            totalResults: result.length, 
            pageNumber: 1, 
            resultsPerPage: 20
        }
    }
}

export const Main: Story = {
    args: {
        searchFn, 
        renderItem:(v: Todo) => {
            return <div>{v.name}</div>
        },
        itemKey: "id",
        onSelectValue: (v) => alert(JSON.stringify(v))
        
    },
    parameters: {
        
    },

}
