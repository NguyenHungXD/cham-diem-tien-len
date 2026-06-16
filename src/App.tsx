import { CardGameApp } from './Components/CardGame/CardGameApp';
import { CardGameProvider } from './Providers/CardGameProvider';

const App = () => {
  return (
    <CardGameProvider>
      <CardGameApp />
    </CardGameProvider>
  );
};

export default App;
