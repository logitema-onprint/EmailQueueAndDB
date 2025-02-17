import { RequestHandler, Request, Response } from "express";
import { rulesQueries } from "../../queries/rulesQueries";

export const getRules: RequestHandler = async (req: Request, res: Response) => {
    try {


        const query = await rulesQueries.getAllRules()
        if (query.error) {
            res.status(400).json({
                success: false,
                message: `${query.error}`,
            });
        }

        res.status(200).json({
            success: true,
            data: query.data,
        });
    } catch (error) {
        res.status(500).json({
            error: `Server error ${error}`,
        });
    }
};
