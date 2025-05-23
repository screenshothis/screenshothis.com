import PlayCircleSolidIcon from "virtual:icons/hugeicons/play-circle-solid";

import { Link } from "@tanstack/react-router";

import { cn } from "#/utils/cn.ts";
import { CodeBlock } from "../code-block.tsx";
import { Button } from "../ui/button.tsx";

export function CodeSection({
	className,
	...props
}: React.ComponentPropsWithRef<"section">) {
	return (
		<section id="code" className={cn("px-2 lg:px-0", className)} {...props}>
			<div className="container relative max-w-6xl border-x bg-(--bg-white-0) p-4 pt-24 lg:px-8">
				<div className="-mt-40 lg:-mt-80 z-40 grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-24">
					<div className="grid gap-2">
						<CodeBlock
							wrapperClassName="shadow-2xl"
							lang="bash"
							children={[
								"https://api.screenshothis.com/v1/screenshots/take",
								"   ?api_key=<your-api-key>",
								"   &url=https://tanstack.com",
								"   &width=1920",
								"   &height=1080",
								"   &format=jpeg",
								"   &block_ads=true",
								"   &block_cookie_banners=true",
								"   &block_trackers=true",
								"   &prefers_color_scheme=light",
								"   &prefers_reduced_motion=reduce",
							].join("\n")}
							className="rounded-4 text-paragraph-sm"
						/>
						<div className="flex justify-end">
							<Button
								asChild
								trailingIconClassName="easy-out-in duration-300 group-hover:translate-x-0.5"
								trailingIcon={PlayCircleSolidIcon}
								$size="sm"
							>
								<Link to="/playground">Try it out now</Link>
							</Button>
						</div>
					</div>

					<img
						src="/img/tanstack.jpeg"
						alt="Showcase showing Tanstack.com"
						className="aspect-video rounded-8 bg-(--bg-white-0) shadow-2xl outline outline-(--stroke-soft-200)"
						loading="eager"
						fetchPriority="high"
						width={1920}
						height={1080}
					/>
				</div>
			</div>
		</section>
	);
}
