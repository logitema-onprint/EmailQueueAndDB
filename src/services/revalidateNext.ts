// services/RevalidateService.ts
import logger from "../utils/logger";
import config from "../config";

interface RevalidateResponse {
    success: boolean;
    error?: string;
}

export class RevalidateService {
    private static readonly NEXTJS_URL = config.next.nextUrl
    private static readonly SECRET = config.next.secret

    static async revalidateQueue(): Promise<RevalidateResponse> {
        try {
            const response = await fetch(`${this.NEXTJS_URL}/api/revalidate/queues`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: this.SECRET,
                    path: '/queues'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to revalidate queue cache');
            }

            logger.success('Queue cache revalidated successfully');
            return { success: true };

        } catch (error) {
            logger.error('Revalidate queue cache error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static async revalidateTag(): Promise<RevalidateResponse> {
        try {
            const response = await fetch(`${this.NEXTJS_URL}/api/revalidate/queues`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: this.SECRET,
                    path: '/queues/tags'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to revalidate tag cache');
            }

            logger.success('Tag cache revalidated successfully');
            return { success: true };

        } catch (error) {
            logger.error('Revalidate tag cache error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static async revalidateMultiple(paths: string[]): Promise<RevalidateResponse> {
        try {
            const results = await Promise.all(
                paths.map(path =>
                    fetch(`${this.NEXTJS_URL}/api/revalidate/queues`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            secret: this.SECRET,
                            path
                        })
                    })
                )
            );

            const hasFailure = results.some(response => !response.ok);
            if (hasFailure) {
                throw new Error('Failed to revalidate some paths');
            }

            logger.success(`Successfully revalidated multiple paths: ${paths.join(', ')}`);
            return { success: true };

        } catch (error) {
            logger.error('Revalidate multiple paths error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static async revalidateAll(): Promise<RevalidateResponse> {
        return this.revalidateMultiple(['/queues', '/tags', '/dashboard']);
    }
}

