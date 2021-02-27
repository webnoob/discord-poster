export interface DiscordChannel {
  id: string
  label: string
  channelId: string
  serverId: string
}

export interface DiscordCategory {
  id: string
  label: string
  children: DiscordChannel[]
}
