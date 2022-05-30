# Prérequis
* NodeJS, j'ai la version 16 (LTS) mais sans doute que des plus anciennes fonctionnent
* un terminal

# Comment tricher

Commence par `npm install`, ça peut être utile

1. Le script `scrapper.js` va charger un fichier json (`dic.json`) à partir du site web [listedesmots.net](https://www.listesdemots.net/accueil.htm). Une bête requête http sur les URL que le site propose (la requête, pagination, etc... est formée par l'URL).
2. Le script `solver.js` permet ensuite de résoudre un problème. Il va charger la liste de tous les mots et vous demander quelques infos.

Le script `solver.js` demande successivement la taille du mot, sa première lettre, puis le résultat successif de tous les mots qu'il va proposer. il faudra taper la réponse comme suit :
* 0 = la lettre n'est pas présente
* 1 = la lettre est mal placée
* 2 = dans le mille

_exemple :_

🟥🟨🟨🟥⬛️⬛️⬛️🟨🟨 donnera `211200011`

### note
Certains mots ne sont pas connu du site, il faudra taper `&` à la place de la série de chiffre pour le faire disparaître du dictionnaire.

# Note technique
C'est dev en JS parce que je suis pas arrivé à setup un projet TypeScript et ça m'a pris la tête.

J'utilise [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) pour faire les questions, [jsdom](https://www.npmjs.com/package/jsdom) pour scrap le site web, et c'est mar.

## Licence
M'en balance complet, fait pas ta tepu c'est tout.