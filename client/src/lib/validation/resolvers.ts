/**
 * Re-exports the Zod resolver for React Hook Form.
 *
 * Why here: all forms import from this single path, so swapping the resolver
 * library (Zod → Yup, etc.) requires one change rather than many.
 *
 * Usage:
 *   import { zodResolver } from "@/lib/validation/resolvers";
 *   const form = useForm({ resolver: zodResolver(MySchema) });
 */
export { zodResolver } from "@hookform/resolvers/zod";
