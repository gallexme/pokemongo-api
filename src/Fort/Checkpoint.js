import Fort from './Fort'

/**
 * Checkpoint is a "pokestop" where you can
 * get items from it by spining.
 */
class Checkpoint extends Fort {
    constructor(props, parent) {
        super(props, parent)

        let modified = this.last_modified_timestamp_ms.toNumber()
        let cooldown = this.cooldown_complete_timestamp_ms.toNumber()

        this.isCheckpoint = true
            // The date when you can collect rewards again
        this.cooldown = cooldown ? new Date(cooldown) : null
        this.modified = new Date(modified)

        delete this.type
        delete this.last_modified_timestamp_ms
        delete this.cooldown_complete_timestamp_ms
        delete this.owned_by_team
        delete this.guard_pokemon_id
        delete this.guard_pokemon_cp
        delete this.gym_points
        delete this.is_in_battle
        delete this.sponsor
        delete this.rendering_type
    }

    /**
     * Gets detail about a pokestop
     *
     * @return {[type]} [description]
     */
    details() {
        return this.parent.Call([{
            request: 'FORT_DETAILS',
            message: {
                fort_id: this.id,
                latitude: this.latitude,
                longitude: this.longitude,
            }
        }])
    }

    /**
     * search spins the pokestop
     * you get pokemon balls among other things
     *
     * @return {Promise} Resolves to items awarded
     */
    async search() {
        let { latitude, longitude } = this.parent.player.location

        if (this.distance > 39) {
            this.parent.log.info('[+] To far away, cant search thisone')
            return false
        }

        if (this.cooldown !== null) {
            this.parent.log.info('[+] Cooldown active, please wait..')
            return false
        }

        var search = await this.parent.Call([{
            request: 'FORT_SEARCH',
            message: {
                fort_id: this.id,
                player_latitude: latitude,
                player_longitude: longitude,
                fort_latitude: this.latitude,
                fort_longitude: this.longitude
            }
        }])
        this.parent.player.lastCheckpointSearch = search
        this.parent.log.info('[+] Search complete')
        return search
    }
}

export default Checkpoint