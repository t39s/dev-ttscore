# Продуктовая цель: стабильные runtime entrypoint'ы, publication-ready RC и rebase ttScore 0.6.0

Продукт:
`ttScore` в интеграции с `ttscore_team`.

Цель:
Устранить version-specific runtime coupling, существующий в принятой стабильной baseline `ttScore 0.5.0 + ttscore_team 0.11.0 RC16`, формализовать уже используемую схему публикации через стабильные `index.html`, сделать комплект RC непосредственно готовым к публикации, получить исправленную линию `ttScore 0.5.1 + ttscore_team 0.11.1`, а затем пересобрать `ttScore 0.6.0` с мультиязычной озвучкой поверх этой исправленной baseline как RC2.

Исходное состояние:
- текущая принятая стабильная baseline: `ttScore 0.5.0 + ttscore_team 0.11.0 RC16`;
- в RC16 `ttscore_team 0.11.0` открывает version-specific root runtime `../ttScore_0.5.0.html`;
- при продуктовой публикации владелец уже использует два стабильных entrypoint:
  - `./index.html` для ttScore;
  - `./team/index.html` для ttscore_team;
- перед публикацией соответствующий versioned HTML вручную дублируется в `index.html`, после чего публикуются оба файла;
- такая схема даёт:
  - стабильный URL текущей публикации;
  - отдельный versioned artifact конкретной версии;
  - накопление Git-истории изменений `index.html` как истории смены текущих публикаций;
  - возможность сравнивать текущий `index.html` с versioned runtime конкретной версии;
- в текущем RC этот publication step не является частью комплекта поставки и выполняется владельцем вручную;
- существует непринятый кандидат `ttScore 0.6.0 + ttscore_team 0.11.0 RC1` с мультиязычной озвучкой;
- его compatibility-схема с прежним именем `ttScore_0.5.0.html` не должна становиться новой архитектурой.

Желаемый результат:
1. Исправленная стабильная линия:
   - версия продукта: `ttScore 0.5.1`;
   - версия Team: `ttscore_team 0.11.1`;
   - первый кандидат этой исправленной линии: RC1;
   - Team запускает ttScore через `../index.html`;
   - Team больше не зависит от version-specific имени root runtime ttScore;
   - обновление версии ttScore само по себе не требует изменения Team только из-за имени HTML-файла.

2. Новый обязательный runtime/package contract RC:
   - `./index.html`;
   - `./ttscore_<version>.html`;
   - `./team/index.html`;
   - `./team/ttscore_team_<version>.html`;
   - соответствующие `assets/` и другие необходимые runtime-файлы.
   - `./index.html` является byte-identical копией `./ttscore_<version>.html`;
   - `./team/index.html` является byte-identical копией `./team/ttscore_team_<version>.html`;
   - `index.html` не является redirect, launcher или отдельной реализацией;
   - RC уже содержит оба `index.html`, поэтому владелец не создаёт их вручную перед публикацией.

3. Naming contract:
   - canonical versioned runtime ttScore называется только `ttscore_<version>.html`;
   - прежнее написание `ttScore_<version>.html` в новой линии не используется как canonical runtime name;
   - Team canonical runtime сохраняет форму `ttscore_team_<version>.html`.

4. Compatibility policy:
   - старый `ttScore_0.5.0.html` не включается в новый комплект как compatibility alias или redirect;
   - обратная зависимость ttScore → versioned Team adapter исследуется;
   - versioned asset-path не считается техническим долгом автоматически;
   - если зависимость является intentional immutable/versioned asset contract, она сохраняется и документируется evidence;
   - устранять её только если исследование подтвердит нежелательный operational coupling.

5. Rebase новой функции:
   - только после стабилизации исправленной линии `0.5.1 + 0.11.1` пересобрать мультиязычный ttScore;
   - целевая интеграция: `ttScore 0.6.0 + ttscore_team 0.11.1 RC2`;
   - прежний `ttScore 0.6.0 + ttscore_team 0.11.0 RC1` остаётся непринятым историческим кандидатом;
   - повторно использовать номер RC1 для пересобранной 0.6.0 запрещено;
   - мультиязычная speech-семантика переносится без изменений.

Ограничения:
- источник первого этапа — только принятая RC16;
- не переносить architectural workaround из непринятого 0.6.0 RC1 как основу исправления;
- `./index.html` и `./team/index.html` — обязательные стабильные operational entrypoint'ы;
- каждый `index.html` должен быть byte-identical соответствующему versioned runtime;
- не вводить redirect/launcher-слои вместо исправления coupling;
- не сохранять старый `ttScore_0.5.0.html` ради совместимости;
- не считать наличие версии в имени asset само по себе дефектом;
- не менять продуктовую семантику RC16 сверх необходимого для исправления runtime/package architecture;
- не менять согласованную семантику мультиязычной озвучки при rebase 0.6.0;
- не вводить новую backend/Firebase-семантику без необходимости;
- изменения должны быть минимальными и evidence-driven.

Критерий достижения:
- по первичным артефактам RC16 зафиксированы все runtime entrypoint'ы и version-specific связи;
- получен `ttScore 0.5.1 + ttscore_team 0.11.1 RC1`;
- Team 0.11.1 открывает `../index.html`, а не version-specific root runtime;
- пакет RC содержит `./index.html` и `./team/index.html`;
- `./index.html` побайтово совпадает с `./ttscore_0.5.1.html`;
- `./team/index.html` побайтово совпадает с `./team/ttscore_team_0.11.1.html`;
- canonical versioned имя ttScore приведено к `ttscore_<version>.html`;
- старый `ttScore_0.5.0.html` отсутствует в новом operational package;
- зависимость ttScore → Team adapter исследована и либо обоснованно сохранена, либо устранена по evidence;
- полный regression подтверждает сохранение поведения принятой RC16, включая Team integration, restore/Undo, Firebase/live/report flows, онлайн-табло и звук;
- publication package можно загрузить без ручного создания/переименования `index.html`;
- после стабилизации первого этапа получен `ttScore 0.6.0 + ttscore_team 0.11.1 RC2`;
- RC2 наследует новый entrypoint/package contract и не использует compatibility-файл старой версии;
- все ранее согласованные проверки мультиязычной озвучки проходят;
- manifest/integrity проверки подтверждают состав и byte-identity обоих `index.html`;
- нет открытых BLOCKER/HIGH и нет MEDIUM, делающего новую схему временной или зависящей от старого version-specific root имени;
- сформирован Next Cycle Brief; STOP допускается только после evidence по обоим этапам.

Исследование:
Обязательно.

До разработки исследовать фактический RC16 и непринятый `0.6.0 + 0.11.0 RC1` по первичным артефактам:
- runtime entrypoint'ы;
- Team → ttScore URL-building;
- ttScore → Team adapter dependency;
- query/hash propagation;
- report/viewer links;
- restore/Undo;
- hosting/deployment assumptions;
- version metadata;
- package/bundle structure;
- различие между operational coupling, intentional versioned assets и release/audit artifacts.

Технические решения, внутреннюю архитектуру, порядок работ,
тестовую стратегию, исправление найденных дефектов и переходы
между циклами определяй самостоятельно в пределах этой цели.

Работай автономно в продуктовом цикле.
