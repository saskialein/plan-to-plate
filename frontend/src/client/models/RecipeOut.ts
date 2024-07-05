/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommentOut } from './CommentOut';

export type RecipeOut = {
    title: string;
    url?: (string | null);
    filePath?: (string | null);
    description?: (string | null);
    storeInVectorDb?: boolean;
    categories?: Array<string>;
    id: number;
    ownerId: number;
    comments?: Array<CommentOut>;
};

