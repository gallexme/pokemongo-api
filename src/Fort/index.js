import Checkpoint from './Checkpoint'
import Gym from './Gym'

export default (fort, parent) => {
    switch (fort.type) {
        case 0:
            return new Gym(fort, parent);
        case 1:
            return new Checkpoint(fort, parent);
    }
}