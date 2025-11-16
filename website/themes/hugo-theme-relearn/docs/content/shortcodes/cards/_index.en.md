+++
categories = ['howto', 'reference']
description = 'Show content in a set of cards'
title = 'Cards'
+++

The `cards` shortcode displays your content in a grouped set of cards.

{{< cards >}}
{{% card title="Python Example" href="https://example.com" %}}
The AI native programming language.

```python
print("Hello World!")
```

{{% /card %}}
{{% card title="Terminal Example" %}}
For guys who like to tinker around.

```bash
echo "Hello World!"
```

{{% /card %}}
{{% card title="C Example" %}}
For the connoisseur of programming.

```c
printf("Hello World!");
```

{{% /card %}}
{{< /cards >}}

## Usage

{{< tabs groupid="shortcode-parameter">}}
{{% tab title="shortcode" %}}

````go
{{</* cards */>}}
{{%/* card title="Python Example" href="https://example.com" */%}}
The AI native programming language.

```python
print("Hello World!")
```
{{%/* /card */%}}
{{%/* card title="Terminal Example" */%}}
For guys who like to tinker around.

```bash
echo "Hello World!"
```
{{%/* /card */%}}
{{%/* card title="C Example" */%}}
For the connoisseur of programming.

```c
printf"Hello World!");
```
{{%/* /card */%}}
{{</* /cards */>}}
````

{{% /tab %}}
{{% tab title="partial" %}}

````go
{{ partial "shortcodes/cards.html" (dict
  "page"  .
  "content" (slice
    (dict
      "href" "https://example.com"
      "title" "Pyhton Example"
      "content" ("The AI native programming language.\n\n```python\nprint(\"Hello World!\")\n```" | .RenderString)
    )
    (dict
      "title" "Terminal Example"
      "content" ("For guys who like to tinker around.\n\n```bash\necho \"Hello World!\"\n```" | .RenderString)
    )
    (dict
      "title" "C Example"
      "content" ("For the connoisseur of programming.\n\n```c\nprintf(\"Hello World!\");\n```" | .RenderString)
    )
  )
)}}
````

{{% /tab %}}
{{< /tabs >}}

If you just want a single card you can instead call the [`card` shortcode](shortcodes/card) standalone.

Also follow the above link to see the parameter for each nested card.

### Parameter

| Name                  | Default              | Notes       |
|-----------------------|----------------------|-------------|
| **template**          | `default`            | The template to be used to display all cards in the set. Can be overridden for each card.<br><br>- `default`: The standard layout<br>- `debug`: A debug layout helping you in development<br><br>See the `card` shortcode how to [use your own templates](shortcodes/card#card-templates). |
| _**&lt;content&gt;**_ | _&lt;empty&gt;_      | Arbitrary number of cards defined with the `card` sub-shortcode. |

## Examples

### Lots of Cards

````go
{{</* cards */>}}
{{%/* card title="Python" */%}}
The AI native programming language.
{{%/* /card */%}}
{{%/* card title="Terminal" */%}}
For guys who like to tinker around.
{{%/* /card */%}}
{{%/* card title="C" */%}}
For the connoisseur of programming.
{{%/* /card */%}}
{{%/* card title="C++" */%}}
For the guys that can cope with syntax.
{{%/* /card */%}}
{{%/* card title="C#" */%}}
For guys that need two destructors.
{{%/* /card */%}}
{{</* /cards */>}}
````

{{< cards >}}
{{% card title="Python" %}}
The AI native programming language.
{{% /card %}}
{{% card title="Terminal" %}}
For guys who like to tinker around.
{{% /card %}}
{{% card title="C" %}}
For the connoisseur of programming.
{{% /card %}}
{{% card title="C++" %}}
For the guys that can cope with syntax.
{{% /card %}}
{{% card title="C#" %}}
For guys that need two destructors.
{{% /card %}}
{{< /cards >}}

### Lots of Cards with Templates

````go
{{</* cards  template="debug" */>}}
{{%/* card title="Python" */%}}
The AI native programming language.
{{%/* /card */%}}
{{%/* card title="Terminal" template="default" */%}}
For guys who like to tinker around.
{{%/* /card */%}}
{{%/* card title="C" */%}}
For the connoisseur of programming.
{{%/* /card */%}}
{{%/* card title="C++" */%}}
For the guys that can cope with syntax.
{{%/* /card */%}}
{{%/* card title="C#" */%}}
For guys that need two destructors.
{{%/* /card */%}}
{{</* /cards */>}}
````

{{< cards template="debug">}}
{{% card title="Python" %}}
The AI native programming language.
{{% /card %}}
{{% card title="Terminal" template="default" %}}
For guys who like to tinker around.
{{% /card %}}
{{% card title="C" %}}
For the connoisseur of programming.
{{% /card %}}
{{% card title="C++" %}}
For the guys that can cope with syntax.
{{% /card %}}
{{% card title="C#" %}}
For guys that need two destructors.
{{% /card %}}
{{< /cards >}}
