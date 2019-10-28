import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

/**
 * This is needed in order for us to be able to use Enzyme in our tests
 * Enzyme allows for "shallow" rendering of components (i.e. rendering
 * them in a virtual DOM so they run faster)
 */
Enzyme.configure({ adapter: new Adapter() });