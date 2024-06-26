import { type Guild, type Message, type PermissionsBitField, type User, type Channel } from "discord.js";
import { Client } from "./Client.js";
import { client } from "../../index.js";
import { PrismaClient } from "@prisma/client";
import { handleMessage } from "../utils/functions.js";

interface CommandOptions {
    name: string;
    aliases?: string[];
    description?: string;
    detailedDescription?: { usage?: string; examples?: string[] };
    permissions?: {
        commands_channel?: boolean;
        staff?: boolean;
        admin?: boolean;
        dev?: boolean;
        node?: string;
        user?: PermissionsBitField[];
        client?: PermissionsBitField[];
    };
}

export interface CommandContext {
    db: PrismaClient;
    client: Client;
    directory: string;

    executed?: {
        message: Message;
        user: User;
        userRoles?: string[] | null;
        guild: Guild;
        channel: Channel;
    };
}

export default abstract class Command {
    public context: CommandContext;

    public directory?: string;

    public options: CommandOptions;

    public name: string;
    public aliases?: string[];

    public test = async (command: Command, context: CommandContext, message: Message, args?: string[]) => {
        try {
            const guildConfig = context.client.guildConfigs.get(context.executed!.guild.id);

            if (
                command.options.permissions &&
                command.options.permissions.dev &&
                context.executed!.user.id !== context.client.developerId
            )
                return "FAILED";

            if (
                command.options.permissions &&
                command.options.permissions.staff &&
                !context.executed!.userRoles!.includes(guildConfig!.roles.allStaff)
            )
                return "FAILED";

            if (
                command.options.permissions &&
                command.options.permissions.commands_channel &&
                context.executed!.channel.id !== guildConfig!.channels.commands &&
                !context.executed!.userRoles!.includes(guildConfig!.roles.allStaff)
            )
                return handleMessage(
                    message,
                    context,
                    `This command belongs in <#${guildConfig!.channels.commands}>, not here.`
                );

            return this.run(message, args);
        } catch (error) {
            throw error;
        }
    };

    public abstract run: (...args: any[]) => unknown;

    public constructor(context: CommandContext, options: CommandOptions) {
        this.context = context ?? { client };
        this.options = options;
        this.name = options.name;
        this.aliases = options.aliases;
    }
}
