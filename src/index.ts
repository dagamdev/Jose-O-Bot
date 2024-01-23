import { SECRET_KEY, DB_URL } from './utils/config'
import { BotClient } from './client'

new BotClient().start(SECRET_KEY, DB_URL)
