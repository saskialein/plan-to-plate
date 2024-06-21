/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommentCreate } from './CommentCreate';

export type Body_recipes_create_recipe = {
    title: string;
    url?: string;
    file?: Blob;
    description?: string;
    store_in_vector_db?: boolean;
    comments?: Array<CommentCreate>;
};

