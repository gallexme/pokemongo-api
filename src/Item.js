/**
 * Called if a parameter is missing and
 * the default value is evaluated.
 */
function mandatory() {
    throw new Error('Missing parameter');
}

class Item {
    constructor(props, parent) {
        Object.assign(this, props)
        Object.defineProperty(this, 'parent', { value: parent })
        delete this.id
    }

    /**
     * Uses a spray-type medecine for treating the wonds of the Pokémon
     *
     * @param  {Pokemon} pokemon The Pokémon that you want to give HP to
     * @return {[type]}          [description]
     */
    usePotion(pokemon) {
        // TODO: check if fainted?
        //
        // if(fainted)
        //   throw new Error("You need to review the pokemon first")

        return this.parent.Call([{
            request: 'USE_ITEM_POTION',
            message: {
                item_id: this.item_id,
                pokemon_id: pokemon.pokemon_id,
            }
        }])
    }

    /**
     * Gives a berry to the pokemon you are trying to captureing
     * And lowers the count by one
     *
     * @param  {[type]} pokemon A catchable pokemon
     * @return {[type]}         [description]
     */
    async useCapture(pokemon) {
        let res = await this.parent.Call([{
            request: 'USE_ITEM_CAPTURE',
            message: {
                item_id: this.item_id,
                encounter_id: pokemon.encounter_id,
                spawn_point_id: pokemon.spawn_point_id,
            }
        }])

        this.count--
            return res
    }

    /**
     * Revive fainted Pokémon. It also restores
     * half of a fainted Pokémon's maximum HP
     *
     * @param  {[type]} pokemon [description]
     * @return {[type]}         [description]
     */
    useRevive(pokemon) {
        return this.parent.Call([{
            request: 'USE_ITEM_REVIVE',
            message: {
                item_id: this.item_id,
                pokemon_id: pokemon.pokemon_id,
            }
        }])
    }

    /**
     * [useGym description]
     * @param  {[type]} fort [description]
     * @return {[type]}      [description]
     */
    useGym(fort) {
        let { latitude, longitude } = this.parent.player.location

        return this.parent.Call([{
            request: 'USE_ITEM_GYM',
            message: {
                item_id: this.item_id,
                gym_id: fort.gym_id,
                player_latitude: latitude,
                player_longitude: longitude,
            }
        }])
    }

    /**
     * uses a incubator on a egg that will
     * break after you have walked the distance
     *
     * @param  {[type]} pokemon [description]
     * @return {[type]}         [description]
     */
    useIncubator(pokemon) {
        return this.parent.Call([{
            request: 'USE_ITEM_EGG_INCUBATOR',
            message: {
                item_id: this.item_id,
                pokemon_id: pokemon.pokemon_id,
            }
        }])
    }

    /**
     * [useXpBoost description]
     * @return {[type]} [description]
     */
    useXpBoost() {
        return this.parent.Call([{
            request: 'USE_ITEM_XP_BOOST',
            message: {
                item_id: this.item_id,
            }
        }])
    }

    /**
     * Recycles the item
     *
     * @param  {Number} count Count of the items you want to recycle
     * @return {[type]}       [description]
     */
    recycle(count = 1) {
        return this.parent.Call([{
            request: 'RECYCLE_INVENTORY_ITEM',
            message: {
                item_id: this.item_id,
                count,
            }
        }])
    }
}
export default Item