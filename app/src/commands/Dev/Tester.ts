import { Message } from "discord.js";
import Command, { CommandContext } from "../../lib/structures/Command.js";
import { handleLevelRoles } from "../../lib/utils/functions.js";

export default abstract class TesterCommand extends Command {
    public constructor(context: CommandContext) {
        super(context, {
            name: "Tester",
            permissions: {
                dev: true,
            },
            description: "funny testing stuff",
        });
    }

    public override run = async (message: Message) => {
        await handleLevelRoles(message, this.context.client, 7);
    };
}
