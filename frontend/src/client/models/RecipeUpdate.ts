/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CommentCreate } from './CommentCreate';

export type RecipeUpdate = {
    title?: (string | null);
    url?: (string | null);
    file_path?: (string | null);
    description?: (string | null);
    store_in_vector_db?: (boolean | null);
    comments?: Array<CommentCreate>;
};

