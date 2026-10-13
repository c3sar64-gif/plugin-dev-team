# Autenticación y roles

## Login propio con JWT

| Token | Duración | Dónde viaja |
|---|---|---|
| Access token | 15 minutos | Cabecera `Authorization: Bearer` |
| Refresh token | 7 días, rotativo | Cookie httpOnly |

```
POST /api/auth/login     { usuario, clave } → accessToken; deja el refresh token en la cookie
POST /api/auth/refresh   usa la cookie → accessToken nuevo y refresh token nuevo
POST /api/auth/logout    invalida el refresh token y borra la cookie
```

- **Rotativo** significa que cada uso del refresh token lo reemplaza por otro. Si se presenta uno ya usado, se invalida la sesión completa.
- El refresh token se guarda en la base como hash, nunca en texto plano.
- La cookie es `HttpOnly`, `Secure` y `SameSite=Strict`.
- La clave del usuario se guarda con un hash lento y con sal (por ejemplo, el `PasswordHasher` de ASP.NET Core).

## El rol se lee de la base en cada petición

El token dice quién es el usuario; **el rol lo decide la base**. Así un cambio de rol aplica de inmediato, sin esperar a que venza el token.

1. La API valida la firma y la vigencia del access token.
2. Una transformación de claims (`IClaimsTransformation`) lee el rol del usuario en la base.
3. Lo normaliza a mayúsculas y lo agrega al `ClaimsPrincipal`.
4. Si el usuario no existe, está inactivo o su rol no se reconoce, el rol es `GUEST`.

`GUEST` no tiene acceso a ningún dato.

## Roles

```csharp
public static class Roles
{
    public const string Admin = "ADMIN";
    public const string Encargado = "ENCARGADO";
    public const string Guest = "GUEST";
}
```

- Son constantes de texto en mayúsculas, definidas una sola vez. La lista concreta la define cada proyecto.
- En los controladores se usan las constantes, nunca el texto: `[Authorize(Roles = Roles.Admin)]`.
- Varios roles: `[Authorize(Roles = Roles.Admin + "," + Roles.Encargado)]`.

## El servidor prohíbe; la interfaz solo oculta

- **Todo endpoint lleva `[Authorize]` con sus roles.** Un endpoint sin atributo es un error, salvo el login.
- Que la interfaz no muestre un botón no protege nada: la petición se puede hacer igual.
- Por defecto el acceso es por rol: quien tiene el rol ve todos los datos de ese recurso. El filtro por filas es opcional (ver `acceso-por-filas.md`).

## Usuario actual

```csharp
public interface ICurrentUser
{
    Guid Id { get; }
    string Rol { get; }
    bool EsAdmin { get; }
}
```

Los servicios lo reciben por inyección. No leen `HttpContext`.

## Integraciones entrantes: clave de API

Un sistema externo que llama a la API no usa el login de personas.

- Se autentica con la cabecera `X-Api-Key`.
- Hay una clave por sistema. Se guarda como hash.
- Sus endpoints viven aparte, en `Controllers/Integraciones/`, y solo aceptan clave de API.
- Sus operaciones son idempotentes: repetir la misma llamada no duplica nada.

## Qué no hacer

- Guardar el access token en `localStorage` junto con datos sensibles sin necesidad, o el refresh token en cualquier lugar accesible desde JavaScript.
- Confiar en un rol que viene dentro del token.
- Escribir secretos (clave de firma del JWT, claves de API) en el código o en un archivo versionado. Van en variables de entorno.
- Devolver mensajes distintos para «usuario no existe» y «clave incorrecta».
