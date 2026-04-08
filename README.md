# `@wabot-dev/create`

CLI para:

- crear un nuevo proyecto Wabot desde el template oficial
- instalar skills empaquetadas en distintos homes o targets de agentes

## Instalación

```bash
npm install
```

Para probar el binario local:

```bash
node ./bin/create-wabot.mjs --help
```

## Comando principal

Crear un proyecto nuevo:

```bash
create-wabot <project-directory>
```

Ejemplo:

```bash
create-wabot my-wabot-app
```

Variaciones:

```bash
create-wabot my-wabot-app --db-url "postgres://localhost:5432/wabot"
create-wabot my-wabot-app --llm-url "http://localhost:3000"
create-wabot my-wabot-app --api-key "my-api-key"
create-wabot my-wabot-app --db-url "postgres://localhost:5432/wabot" --llm-url "http://localhost:3000" --api-key "my-api-key"
```

Si no pasás `project-directory`, el CLI pregunta el nombre del proyecto en modo interactivo.

## Comando de skills

Instalar una skill empaquetada:

```bash
create-wabot skill add <skill-name>
```

Skill disponible actualmente:

```bash
create-wabot skill add wabot-framework
```

## Variaciones de `skill add`

### 1. Instalación global por defecto

Usa el home del sistema y, si no se indica target, instala para `codex`.

```bash
create-wabot skill add wabot-framework
```

Resultado esperado:

- `<os.homedir()>/.codex/skills/wabot-framework`

### 2. Instalación local al proyecto

Instala en el workspace actual:

```bash
create-wabot skill add wabot-framework --local
```

Resultado esperado:

- `./.agents/skills/wabot-framework`

### 3. Instalación global con home explícito

Instala usando un home root manual:

```bash
create-wabot skill add wabot-framework --global --home "/Users/demo"
create-wabot skill add wabot-framework --global --home "C:\\Users\\demo"
```

### 4. Instalación global para un target único

```bash
create-wabot skill add wabot-framework --global --target codex
create-wabot skill add wabot-framework --global --target claude
create-wabot skill add wabot-framework --global --target agents
```

Con `--home`:

```bash
create-wabot skill add wabot-framework --global --home "C:\\Users\\demo" --target codex
create-wabot skill add wabot-framework --global --home "C:\\Users\\demo" --target claude
create-wabot skill add wabot-framework --global --home "C:\\Users\\demo" --target agents
```

Rutas esperadas:

- `codex` -> `<home>/.codex/skills/wabot-framework`
- `claude` -> `<home>/.claude/skills/wabot-framework`
- `agents` -> `<home>/.agents/skills/wabot-framework`

### 5. Instalación global para múltiples targets

```bash
create-wabot skill add wabot-framework --global --targets codex,claude
create-wabot skill add wabot-framework --global --targets agents,codex,claude
```

Con `--home`:

```bash
create-wabot skill add wabot-framework --global --home "C:\\Users\\demo" --targets agents,codex,claude
```

Esto instala la misma skill en múltiples destinos dentro del mismo home root.

## Reglas útiles

- `--local` y `--global` son excluyentes.
- `--home`, `--target` y `--targets` aplican solo con `--global`.
- Si no se pasa `--target` ni `--targets`, el default es `codex`.
- Si el destino ya existe, el comando falla y no sobreescribe.
- Si el target no existe en la lista soportada, el comando falla.

## Targets soportados

```text
agents
codex
claude
```

## Ejemplos completos

Crear un proyecto:

```bash
create-wabot my-bot
```

Crear un proyecto con variables iniciales:

```bash
create-wabot my-bot \
  --db-url "postgres://localhost:5432/mybot" \
  --llm-url "http://localhost:3000" \
  --api-key "secret"
```

Instalar la skill local al repo:

```bash
create-wabot skill add wabot-framework --local
```

Instalar la skill para Claude en otro home:

```bash
create-wabot skill add wabot-framework --global --home "C:\\Users\\another-user" --target claude
```

Instalar la skill para varios agentes en el mismo home:

```bash
create-wabot skill add wabot-framework --global --home "C:\\Users\\another-user" --targets agents,codex,claude
```

## Desarrollo

Mostrar ayuda:

```bash
node ./bin/create-wabot.mjs --help
node ./bin/create-wabot.mjs skill add --help
```
