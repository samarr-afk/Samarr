import { Route, Switch } from "wouter";
import Home from "./pages/home";
import Admin from "./pages/admin";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
