---
title: "Agent 钱包到底能证明什么"
date: 2026-08-18
excerpt: "Cloudflare Wallets 能把 agent 的付款连回一个账号，也能限制它怎么花钱。但还有另一个问题：一笔没有越界的购买，真的是账号持有者想买的吗？"
tags: ["ai", "security", "software", "note"]
lang: zh
translationKey: wallet-is-not-a-conscience
maturity: seedling
connections:
  linksTo: ["helpful-agents-authorization-bug"]
---

一个 agent 花了一笔钱，至少可以问三件不同的事：它代表哪个账号？这笔钱有没有越过事先设好的限制？这件东西本身，是不是账号持有者真正想让它买的？Cloudflare 8 月 4 日公布的 Wallets，把前两件事做成了很具体的基础设施。第三件事，不在目前公开的机制里。

产品刚公布时，开放的是 `cloudflare.pay` 身份标识的预留。完整的钱包功能，包括入金和 Virtual Wallet，还计划在之后几个月上线。按公布的设计，一个 Account Wallet 可以给 agent 发一个 Virtual Wallet，再用额度、商家白名单和单笔上限约束它的消费。

这套机制能回答「钱从哪个 Cloudflare 账号来」以及「有没有超出预设边界」。Cloudflare 自己的公告又把「信任」这个词放在了这些机制旁边。CEO Matthew Prince [在发布时说](https://www.cloudflare.com/press/press-releases/2026/cloudflare-gives-ai-agents-an-identity-and-a-wallet/)：「Cloudflare 能给 agent 一张脸，一条连到它背后那个人或组织的链路，这样信任、问责，还有真正的商业往来，才跟得上来。」这句话把几种不同的保证放在了一起，但已公布的机制并不会让它们变成同一种保证。

可追溯是一种保证，消费边界是另一种，逐笔购买意图又是第三种。假设一个本来就有合法权限的 agent，把整月额度都花在白名单商家的一堆没人想要的订阅上，而且每一笔都低于单笔上限。按已经公布的规则，这些购买并没有越界。限制也没有失效，它只是忠实执行了事先配置的边界。它没有回答的是：这些被允许的购买，究竟是不是账号持有者真正想要的。

[同一周 Forbes 的一篇评论](https://www.forbes.com/sites/boazsobrado/2026/08/09/you-can-fake-everything-cloudflare-just-gave-ai-agents-wallets/)还质疑了更前面一层：agent 声称的身份本身是否真的可靠。就算以后 `cloudflare.pay` 的身份验证完全成立，上面的区别也不会消失。一笔钱可以正确追溯到账号，可以完全符合所有消费限制，同时依然不是账号持有者会主动选择的那笔购买。

因此，一套 agent 支付系统可以对应三件不同的事：**这笔付款对应哪个账号？它被允许花多少、花在哪里？这笔具体的购买是不是原本的意图？** Cloudflare 的发布材料给前两件事都配了具体机制，第三件事没有对应的判断机制。把付款归到一个账号，也比证明现实世界里究竟是谁在指挥这个 agent 要窄得多。只看「信任」这个词，本身分不出这些保证。
