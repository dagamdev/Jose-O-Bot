import type { ClientEvents } from 'discord.js'
import type { BUTTON_IDS } from './utils/constants'

export type EventNames = keyof ClientEvents

export type ButtonIDKeys = keyof typeof BUTTON_IDS
