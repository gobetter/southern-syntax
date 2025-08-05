import { z } from 'zod';

export const idSchema = z.string().min(1, 'error_field_is_required');
export const idParamSchema = z.object({ id: idSchema });
