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

Here's a test that actually works, from [a July survey of 53 AI-native games and prototypes](https://arxiv.org/abs/2607.00527). Take the generative model out of the game. If the core loop collapses, or turns into something fundamentally different, the game is AI-native. If it keeps working fine without the model, you were looking at AI-augmented content, not an AI-native game, and passing that test says nothing about whether the result is any good — which is where I think the current wave falls short: it doesn't really have much taste. Ask a runtime generator for dialogue, a quest, an NPC reaction, and you get some average thing that people kind of expect, statistically reasonable and forgettable the moment it lands.

Look at what actually clears that bar today, and the genre pattern is telling. [AI Dungeon](https://en.wikipedia.org/wiki/AI_Dungeon) is the cleanest case: an LLM improvises the whole story turn by turn, so pull the model and there's no game left, just an empty prompt. [Suck Up!](https://kotaku.com/games/suck-up) is the same shape in different clothes — you're a vampire talking your way past AI neighbors built to say no, and every line is generated live. Both are language games wearing RPG-adjacent clothing: dialogue-driven, model-dependent all the way down. What's missing is a real AI-native strategy game, and that's not just my own search coming up empty. The July survey says so directly: strategy is one of the genres its 53-title corpus barely touches, next to a pile of narrative adventures. That tracks. A strategy game's core loop is rules, state, and tradeoffs. You can bolt generative flavor text onto that, but pulling the model out doesn't collapse the game the way it collapses AI Dungeon.

Compare that to games people actually remember. GTA, the Witcher: the writers built one specific, coherent thing instead of the average of everything a story like that could be. Those games feel real because someone made a choice about what belongs and what doesn't. A system trained to satisfy the widest expectation has no reason to make that choice.

Averaging is the opposite of taste.

Where I'd push back on myself: this doesn't hold for every game. Plenty of good indie games run on nothing making sense, and that's the entire appeal. Chaos is the mechanic, not a bug apologized for in the patch notes. Nobody wants cohesive, handmade logic from a game whose whole pitch is that nothing is supposed to add up. The taste problem only bites where the genre has always promised the opposite: a classic RPG, a story with real stakes, a world a player is meant to trust.

So here's where I land, for now. "AI-native" is a real, checkable category: does the loop survive without the model, yes or no. Whether an AI-native game is worth playing is a separate, harder question, and today's answer is mostly no, because taste isn't something a system optimizing for the expected case can produce on its own. Making the model bigger won't fix that. The fix, if there is one, is a design choice: aim generation at one specific outcome instead of the safe average.
