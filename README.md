# `@wabot-dev/create`

CLI para crear un nuevo proyecto Wabot desde el template oficial e instalar las
skills de agente que **vienen empaquetadas con `@wabot-dev/framework`**.

> Las skills ya no viven en este paquete: son propiedad de `@wabot-dev/framework`
> y se versionan junto con su API. Este CLI las descubre desde el framework
> instalado en el proyecto y las copia a `.claude/`, `.codex/` y/o `.agents/`.

## Uso rápido

```bash
npm create @wabot-dev my-wabot-app
# o
npx @wabot-dev/create my-wabot-app
```

El asistente pregunta: nombre, almacenamiento (memoria/postgres), proveedores de
IA e instalación de skills de agente (por defecto sí). Luego:

1. clona el template oficial,
2. corre `npm install` (deja `@wabot-dev/framework` en `node_modules`),
3. instala el SDK de cada proveedor de IA elegido (`@openrouter/sdk`, `openai`,
   `@anthropic-ai/sdk`, `@google/genai`) en el rango de versiones que declara ese
   framework — desde la 2.0 el framework no los instala solo; se omite el que el
   template ya declara,
4. copia las skills de ese framework a las carpetas de agente elegidas.

Si no pasás `project-directory`, se pregunta el nombre en modo interactivo.

Opciones:

```bash
create-wabot my-wabot-app --db-url "postgres://localhost:5432/wabot"
create-wabot my-wabot-app --lang es
```

## Canal beta

Las builds beta de `@wabot-dev/create` (versión `X.Y.Z-beta.N`) scaffoldean desde
la rama **`beta`** del template (`wabot-dev/wabot-template#beta`), que fija la
versión beta del framework. Las builds estables usan la rama por defecto.

Para forzar una fuente concreta del template (p. ej. probar una rama antes de
publicar) usá la variable de entorno:

```bash
WABOT_TEMPLATE_REF="wabot-dev/wabot-template#beta" create-wabot my-app
```

## Skills en un proyecto existente

Las skills se instalan solas al crear el proyecto. Para **agregarlas o
actualizarlas** más tarde (por ejemplo tras subir la versión del framework), usá
el bin que ships el propio framework:

```bash
npx wabot-skills list                     # lista las skills empaquetadas
npx wabot-skills sync                      # refresca las skills del proyecto a la
                                           # versión de framework instalada
npx wabot-skills sync --agents claude,codex
```

`sync` sobrescribe en el lugar (resync); detecta las carpetas de agente ya
presentes en el proyecto (`.claude`, `.codex`, `.agents`) o usá `--agents`.

## `create-wabot skill add` (instalación puntual)

También podés instalar una skill suelta con este CLI. La fuente es el
`@wabot-dev/framework` resoluble desde el proyecto/entorno actual.

```bash
create-wabot skill add wabot-framework --local          # ./.agents/skills/...
create-wabot skill add wabot-framework --global --target claude
create-wabot skill add wabot-framework --global --targets agents,codex,claude --home "/Users/demo"
```

Reglas:

- `--local` y `--global` son excluyentes.
- `--home`, `--target` y `--targets` aplican solo con `--global`.
- Si no se pasa `--target`/`--targets`, el default es `codex`.
- Si el destino ya existe, falla y no sobrescribe (usá `wabot-skills sync` para refrescar).

Targets soportados: `agents`, `codex`, `claude`.

## Desarrollo

```bash
npm install                # linkea @wabot-dev/framework (file:../wabot-ts) para tests
npm run test:smoke         # smokes del instalador de skills
node ./bin/create-wabot.mjs --help
node ./bin/create-wabot.mjs skill add --help
```
