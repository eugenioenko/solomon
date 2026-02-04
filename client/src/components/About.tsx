import { MainContainer } from "./MainContainer";

export function About() {
  return (
    <MainContainer>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">About Fire'n Ice</h1>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">What is this?</h2>
          <p>
            This is a web application that allows you to <strong>play and create levels</strong> inspired by the classic NES puzzle game{" "}
            <a
              href="https://en.wikipedia.org/wiki/Solomon%27s_Key_2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Fire'n Ice
            </a>{" "}
            (also known as <em>Solomon's Key 2</em>).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">About the Original Game</h2>
          <p>
            <strong>Solomon's Key 2</strong>, known as <strong>Fire'n Ice</strong> in North America, is a puzzle video game released by Tecmo for the Nintendo Entertainment System. It is a prequel to 1986's Solomon's Key and was released in Japan in January 1992, followed by North America and Europe in March 1993.
          </p>
          <p>
            The game takes place on Coolmint Island, an island made of ice and home to the winter fairies. When the evil wizard Druidle begins sending flame monsters to attack and melt the island, the queen of the fairies summons the apprentice wizard Dana to defend them, granting him the use of ice magic to help extinguish the flame monsters.
          </p>
          <p>
            Players control Dana and attempt to put out all the fires by sliding ice blocks into them or dropping blocks on top of them. The game features 10 worlds with 10 stages each, plus 50 bonus stages, and includes a built-in stage editor.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">A Passion Project</h2>
          <p>
            This project started as a passion project back in 2017, born from fond memories of playing Fire'n Ice as a kid. The original implementation can be found on{" "}
            <a
              href="https://github.com/eugenioenko/fire-n-ice"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              GitHub
            </a>
            .
          </p>
          <p>
            The goal was to recreate the magic of this beloved puzzle game for the web. Now, it has evolved to not only let you play levels but also <strong>create your own puzzles</strong> and <strong>share them with the community</strong>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Features</h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Play classic Fire'n Ice style puzzle levels</li>
            <li>Create your own levels with the built-in level editor</li>
            <li>Share your creations with other players</li>
            <li>Discover and play levels created by the community</li>
          </ul>
        </section>
      </div>
    </MainContainer>
  );
}