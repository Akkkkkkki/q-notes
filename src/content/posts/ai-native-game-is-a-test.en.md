---
title: '"AI-native game" is a test, not a vibe'
date: 2026-08-05
excerpt: '"AI-native game" has one honest definition: pull the model out and see if play survives. Passing that test says nothing about whether the result has any taste.'
tags: ["ai", "gaming", "design", "note"]
lang: en
translationKey: ai-native-game-is-a-test
maturity: seedling
connections:
  linksTo: ["taste-is-judgment"]
---

Before anyone writes another trend piece on generative AI and games, here's the question nobody's answering: what actually makes a game "AI-native"?

Here's a test that actually works, from [a July survey of 53 AI-native games and prototypes](https://arxiv.org/abs/2607.00527). Take the generative model out of the game. If the core loop collapses, or turns into something fundamentally different, the game is AI-native. If it keeps working fine without the model, you were looking at AI-augmented content. That line is real and it's checkable, and it says nothing at all about whether the result is any good. That's where I think this wave falls short: it doesn't really have much taste. Ask a runtime generator for dialogue, a quest, an NPC reaction, and you get some average thing that people kind of expect. Statistically reasonable, forgotten the moment it lands.

Look at what clears the bar today and the pattern is hard to miss. [AI Dungeon](https://en.wikipedia.org/wiki/AI_Dungeon) is the cleanest case: an LLM improvises the story turn by turn, so pull the model and there's no game left, just an empty prompt box. [Suck Up!](https://kotaku.com/games/suck-up) is the same shape in different clothes. You play a vampire talking your way past AI neighbors built to say no, and every line is generated live. Both are language games wearing RPG clothing. So is most of the corpus: the survey finds it concentrated on language-forward designs, with strategy and management thinner and less stable than the rest.

That gap isn't an oversight, and the most useful evidence is what a serious strategy attempt had to give up. [Vox Deorum](https://arxiv.org/abs/2512.18564) puts an LLM behind the rival civilizations in Civilization V, and its architecture concedes the hard part up front: the model does the macro-strategic reasoning, while ordinary subsystems keep the rules, the state, and the tactical execution. Nobody handed the model the game. They pointed it at the one job it was good at and fenced off the rest. Strategy wasn't waiting on a model to feel alive anyway. Crusader Kings III has been producing stories nobody wrote for years, out of rules and state alone. That's the survey's central problem too: organizing semantic openness into stable gameplay. It's a much bigger question than who writes the dialogue or draws the art.

Compare that to games people actually remember. GTA, the Witcher, Baldur's Gate 3: the writers built one specific, coherent thing instead of the average of everything a story like that could be. Baldur's Gate 3 is the case that ought to settle it. Its ending branches into [roughly 17,000 possible variations](https://www.pcgamer.com/baldurs-gate-3-has-17000-variations-on-its-ending-a-number-that-gives-me-a-headache-just-thinking-about-it/), depending on choices made across the whole game. One lead writer spent six months just making sure those branches still held together instead of dissolving into noise. That's someone deciding, thread by thread, what should happen, not a system settling for whatever's likely. Those games feel real because someone decided what belongs and what doesn't. A system trained to satisfy the widest expectation has no reason to make that call.

Averaging is the opposite of taste.

Where I'd push back on myself: this doesn't hold for every game. Plenty of good indie games run on nothing making sense, and that's the entire appeal. Chaos is the mechanic, not a bug apologized for in the patch notes. Nobody wants cohesive, handmade logic from a game whose whole pitch is that nothing is supposed to add up. The taste problem only bites where the genre has always promised the opposite: a classic RPG, a story with real stakes, a world a player is meant to trust.

So here's where I land, for now. "AI-native" is a real, checkable category: does the loop survive without the model, yes or no. Whether an AI-native game is worth playing is a separate, harder question, and today's answer is mostly no, because taste isn't something a system optimizing for the expected case can produce on its own. Making the model bigger won't fix that. The fix, if there is one, is a design choice: aim generation at one specific outcome instead of the safe average.
