/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommentCreate } from './CommentCreate';

export type RecipeOut = {
    title: string;
    url?: (string | null);
    file_path?: (string | null);
    description?: (string | null);
    store_in_vector_db?: boolean;
    id: number;
    owner_id: number;
    comments?: Array<CommentCreate>;
};

