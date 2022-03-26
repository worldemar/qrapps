# What is it?
Collection of miniature apps/minigames that fit into a single QR code.
These codes can be scanned and content pasted directly into browser URL.
All apps follow same rules:

- Fit within single QR code, any tricks are okay as long as QR code is scannable.
- Do not require any external resources, fully operable if scanned from paper without internet conenction.

# Why would you do that?
For fun, challenge and as a demonstration of modern browser capabilities.
Fitting entire app in one QR code also keeps them relatively small and simple... until author tries to squeeze code too hard and it becomes unreadeable 😂

# How does it work?
Each app is HTML/JS/CSS webpage containted within own directory in `apps`. Script [`qr.py`](qr.py) will convert each app into [QR code](https://en.wikipedia.org/wiki/QR_code) by 'minifying'/'uglyfying' it and inlining all code into single HTML. This HTML then encoded as QR code [Data URL](https://en.wikipedia.org/wiki/Data_URI_scheme)

# Collection of QR apps! <sub>(generated automatically on push)</sub>
### [demo-clock](bundles/demo-clock/minibundle.html)

