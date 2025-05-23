import { ORPCError } from "@orpc/client";
import { os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

export const requireAuth = o.middleware(({ context, next }) => {
	if (!context.session) {
		console.info("No session");
		throw new ORPCError("UNAUTHORIZED");
	}

	if (!context.session.user) {
		console.info("No user");
		throw new ORPCError("UNAUTHORIZED");
	}

	return next({
		context: {
			...context,
			session: context.session,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);
