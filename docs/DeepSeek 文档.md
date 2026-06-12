# 一、快速开始

## 1.1 首次调用 API

DeepSeek API 使用与 OpenAI/Anthropic 兼容的 API 格式，通过修改配置，您可以使用 OpenAI/Anthropic SDK 来访问 DeepSeek API，或使用与 OpenAI/Anthropic API 兼容的软件。

| **PARAM**            | **VALUE**                                                    |
| -------------------- | ------------------------------------------------------------ |
| base_url (OpenAI)    | `https://api.deepseek.com`                                   |
| base_url (Anthropic) | `https://api.deepseek.com/anthropic`                         |
| api_key              | apply for an [API key](https://platform.deepseek.com/api_keys) |
| model                | `deepseek-v4-flash`<br />`deepseek-v4-pro`<br />`deepseek-chat`(将于 2026/07/24 弃用)<br />`deepseek-reasoner` (将于 2026/07/24 弃用) |

> deepseek-chat 与 deepseek-reasoner 两个模型名将于北京时间 2026/07/24 23:59 弃用。出于兼容考虑，二者分别对应 deepseek-v4-flash 的非思考与思考模式。



### 接入 Agent 工具

DeepSeek API 已接入多种主流 AI Agent 与编程助手工具。如果你使用 Claude Code、GitHub Copilot、OpenCode 等工具，可以直接将 DeepSeek 作为后端模型，无需编写代码即可开始使用。

详见 [Agent 工具接入指南](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code)。

### 调用对话 API

在创建 API key 之后，你可以使用以下样例脚本，通过 OpenAI API 格式来访问 DeepSeek 模型。样例为非流式输出，您可以将 stream 设置为 true 来使用流式输出。

Anthropic API 格式的访问样例，请参考[Anthropic API](https://api-docs.deepseek.com/zh-cn/guides/anthropic_api)。

**CURL**

```sh
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
  -d '{
        "model": "deepseek-v4-pro",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "thinking": {"type": "enabled"},
        "reasoning_effort": "high",
        "stream": false
      }'
```

**Python**

```python
# Please install OpenAI SDK first: `pip3 install openai`
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get('DEEPSEEK_API_KEY'),
    base_url="https://api.deepseek.com")

response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello"},
    ],
    stream=False,
    reasoning_effort="high",
    extra_body={"thinking": {"type": "enabled"}}
)

print(response.choices[0].message.content)
```

**NodeJS**

```javascript
// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-v4-pro",
    thinking: {"type": "enabled"},
    reasoning_effort: "high",
    stream: false,
  });

  console.log(completion.choices[0].message.content);
}

main();
```



## 1.2 模型 & 价格

下表所列模型价格以“百万 tokens”为单位。Token 是模型用来表示自然语言文本的的最小单位，可以是一个词、一个数字或一个标点符号等。我们将根据模型输入和输出的总 token 数进行计量计费。

### 模型细节

| **模型**                                                     | **deepseek-v4-flash**                                        | **deepseek-v4-pro**                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **BASE URL (OpenAI 格式)**                                   | [https://api.deepseek.com](https://api.deepseek.com/)        | [https://api.deepseek.com](https://api.deepseek.com/)        |
| **BASE URL (Anthropic 格式)**                                | https://api.deepseek.com/anthropic                           | https://api.deepseek.com/anthropic                           |
| **模型版本**                                                 | **DeepSeek-V4-Flash**                                        | **DeepSeek-V4-Pro**                                          |
| **思考模式**                                                 | **支持非思考与思考模式（默认）**<br />**切换方式详见**[思考模式](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode) | **支持非思考与思考模式（默认）**<br />**切换方式详见**[思考模式](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode) |
| **上下文长度**                                               | **1M**                                                       | **1M**                                                       |
| **输出长度**                                                 | **最大 384K**                                                | **最大 384K**                                                |
| [Json Output](https://api-docs.deepseek.com/zh-cn/guides/json_mode) | **支持**                                                     | **支持**                                                     |
| [Tool Calls](https://api-docs.deepseek.com/zh-cn/guides/tool_calls) | **支持**                                                     | **支持**                                                     |
| [对话前缀续写（Beta）](https://api-docs.deepseek.com/zh-cn/guides/chat_prefix_completion) | **支持**                                                     | **支持**                                                     |
| [FIM 补全（Beta）](https://api-docs.deepseek.com/zh-cn/guides/fim_completion) | **支持**                                                     | **支持**                                                     |
| 百万tokens输入（缓存命中）                                   | **0.02元**                                                   | **0.025元**                                                  |
| **百万tokens输入（缓存未命中）**                             | **1元**                                                      | **3元**                                                      |
| **百万tokens输出**                                           | **2元**                                                      | **6元**                                                      |
| **并发限制**                                                 | **2500**                                                     | **500**                                                      |

> (1) deepseek-chat 与 deepseek-reasoner 两个模型名将于北京时间 2026/07/24 23:59 弃用。出于兼容考虑，二者分别对应 deepseek-v4-flash 的非思考与思考模式。
> (2) 更多并发限制细节，请参考[限速与隔离](https://api-docs.deepseek.com/zh-cn/quick_start/rate_limit)

### 扣费规则

扣减费用 = token 消耗量 × 模型单价，对应的费用将直接从充值余额或赠送余额中进行扣减。 当充值余额与赠送余额同时存在时，优先扣减赠送余额。

产品价格可能发生变动，DeepSeek 保留修改价格的权利。请您依据实际用量按需充值，定期查看此页面以获知最新价格信息。

## 1.3 Token 用量计算

token 是模型用来表示自然语言文本的基本单位，也是我们的计费单元，可以直观的理解为“字”或“词”；通常 1 个中文词语、1 个英文单词、1 个数字或 1 个符号计为 1 个 token。

一般情况下模型中 token 和字数的换算比例大致如下：

- 1 个英文字符 ≈ 0.3 个 token。
- 1 个中文字符 ≈ 0.6 个 token。

但因为不同模型的分词不同，所以换算比例也存在差异，每一次实际处理 token 数量以模型返回为准，您可以从返回结果的 `usage` 中查看。

### 离线计算 Tokens 用量

您可以通过如下压缩包中的代码来运行 tokenizer，以离线计算一段文本的 Token 用量。

[deepseek_tokenizer.zip](https://cdn.deepseek.com/api-docs/deepseek_v3_tokenizer.zip)

## 1.4 限速与隔离

### 并发限速

对每个账号，DeepSeek API 不同模型的并发限制如下表所示。

**若您有更高的并发需求，可提交[账号扩容申请工单](https://trtgsjkv6r.feishu.cn/share/base/form/shrcnda9jNKvhyYr8xb843xLEzc)，我们将根据您实际的业务需求匹配合适的并发量，扩容并不增加额外的费用。**

| 模型版本              | **并发限制** |
| --------------------- | ------------ |
| **deepseek-v4-pro**   | **500**      |
| **deepseek-v4-flash** | **2500**     |

- 一个请求从发出后，到模型响应完成之前记为一个并发；
- 并发限制以账号粒度计，与 API Key 无关；
- 对于一个账号，在并发限度内，您的 API 请求都会得到响应；超过并发限度时，您会收到 HTTP 429 错误码；

------

### user_id 隔离

用户可以向 API 传递 `user_id` 参数，来实现同一账号下，对您业务侧不同用户的细粒度管理。`user_id` 的具体功能如下：

- **内容安全隔离：**`user_id` 用于我们区分您业务侧的用户身份，以进行内容安全状况处理
- **KVCache 隔离：**`user_id` 用于我们对您业务侧用户进行 KVCache 隔离，以进行隐私管理
- 调度隔离：`user_id`用于我们对您业务侧用户进行调度隔离
  - 对于普通 API 用户，所有 `user_id` 合并计算并发限速；
  - 对于提升了并发配额的 API 用户，我们会限制您账号下的总并发，同时我们会对每个您传入的 `user_id` 进行并发限制（空 id 为一个特殊的 `user_id`）。对每个 `user_id`，deepseek-v4-pro 并发限制为 500，deepseek-v4-flash 并发限制为 2500。若某个 `user_id` 超过了该限制，则您账号下设置了该 `user_id` 的请求将会收到 HTTP 429 错误码；

#### user_id 设置方法

`user_id` 参数需为满足正则表达式 `[a-zA-Z0-9\-_]+` 的字符串，最大长度为 512。请不要在 `user_id` 中包含用户隐私信息。

您可以通过以下方式，设置 `user_id` 参数：

##### OpenAI Chat Completions 接口

HTTP 请求体：

```json
{
    "model": "deepseek-v4-pro",
    "messages": {"role": "user", "content": "Hello!"},
    "user_id": "your_user_id"
}
```



如果您使用的是 OpenAI SDK，您需要将 `user_id` 参数放入 `extra_body` 参数下面：

```python
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[{"role": "user", "content": "Hello!"}],
    extra_body={"user_id": "your_user_id"}
)
```



##### Anthropic 接口

HTTP 请求体：

```json
{
    "model": "deepseek-v4-pro",
    "messages": {"role": "user", "content": "Hello!"},
    "metadata": {"user_id": "your_user_id"},
    "max_tokens": 1024
}
```



如果您使用的是 Anthropic SDK，调用方式如下：

```python
message = client.messages.create(
    model="deepseek-v4-pro",
    messages=[{"role": "user", "type": "text", "content": "Hello!"}],
    metadata={"user_id": "your_user_id"},
    max_tokens=1024
)
```



------

### 请求保活机制

您的请求发出后，有时需要等待一段时间才能获取服务器的响应。在这段时间里，您的 HTTP 请求会保持连接，并持续收到如下格式的返回内容：

- 非流式请求：持续返回空行
- 流式请求：持续返回 SSE keep-alive 注释（`: keep-alive`）

这些内容不影响对响应的 JSON body 的解析。如果您在自己解析 HTTP 响应，请注意处理这些空行或注释。

如果 10 分钟后，请求仍未开始推理，服务器将关闭连接。



## 1.5 错误码

您在调用 DeepSeek API 时，可能会遇到以下错误。这里列出了相关错误的原因及其解决方法。

| 错误码                 | 描述                                                         |
| ---------------------- | ------------------------------------------------------------ |
| 400 - 格式错误         | **原因**：请求体格式错误 <br />**解决方法**：请根据错误信息提示修改请求体 |
| 401 - 认证失败         | **原因**：API key 错误，认证失败 <br />**解决方法**：请检查您的 API key 是否正确，如没有 API key，请先 [创建 API key](https://platform.deepseek.com/api_keys) |
| 402 - 余额不足         | **原因**：账号余额不足 <br />**解决方法**：请确认账户余额，并前往 [充值](https://platform.deepseek.com//top_up) 页面进行充值 |
| 422 - 参数错误         | **原因**：请求体参数错误 <br />**解决方法**：请根据错误信息提示修改相关参数 |
| 429 - 请求速率达到上限 | **原因**：请求速率（TPM 或 RPM）达到上限 <br />**解决方法**：请合理规划您的请求速率。 |
| 500 - 服务器故障       | **原因**：服务器内部故障 <br />**解决方法**：请等待后重试。若问题一直存在，请联系我们解决 |
| 503 - 服务器繁忙       | **原因**：服务器负载过高 <br />**解决方法**：请稍后重试您的请求 |



## 1.6 接入 Agent 工具（略）



# 二、API 指南

## 2.1 思考模式

DeepSeek 模型支持思考模式：在输出最终回答之前，模型会先输出一段思维链内容，以提升最终答案的准确性。

### 思考模式开关与思考强度控制

|                  | 控制参数（OpenAI 格式）                      | 控制参数（Anthropic 格式）                   |
| ---------------- | -------------------------------------------- | -------------------------------------------- |
| **思考模式开关** | `{"thinking": {"type": "enabled/disabled"}}` | `{"thinking": {"type": "enabled/disabled"}}` |
| **思考强度控制** | `{"reasoning_effort": "high/max"}`           | `{"output_config": {"effort": "high/max"}}`  |

> (1) 默认思考开关为 `enabled`；
> (2) 思考模式下，对普通请求，默认 effort 为 high；对一些复杂 Agent 类请求（如 Claude Code、OpenCode），effort 自动设置为 `max`；
> (3) 思考模式下，出于兼容考虑 `low`、`medium` 会映射为 `high`, `xhigh` 会映射为 `max`；

您在使用 OpenAI SDK 设置 `thinking` 参数时，需要将 `thinking` 参数传入 `extra_body` 中：

```python
response = client.chat.completions.create(
  model="deepseek-v4-pro",
  # ...
  reasoning_effort="high",
  extra_body={"thinking": {"type": "enabled"}}
)
```



### 输入输出参数

思考模式不支持 `temperature`、`top_p`、`presence_penalty`、`frequency_penalty` 参数。请注意，为了兼容已有软件，设置参数不会报错，但也不会生效。

在思考模式下，思维链内容通过 `reasoning_content` 参数返回，与 `content` 同级。在后续的轮次的拼接中，可以选择性地返回 `reasoning_content` 给 API：

- 在两个 `user` 消息之间，如果模型**未进行工具调用**，则中间 `assistant` 的 `reasoning_content` 无需参与上下文拼接，在后续轮次中将其传入 API 会被忽略。详见[多轮对话拼接](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode#多轮对话拼接)。
- 在两个 `user` 消息之间，如果模型**进行了工具调用**，则中间 `assistant` 的 `reasoning_content` 需参与上下文拼接，在后续所有 user 交互轮次中必须**回传给 API**。详见[工具调用](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode#工具调用)。

### 多轮对话拼接

在每一轮对话过程中，模型会输出思维链内容（`reasoning_content`）和最终回答（`content`）。如果没有工具调用，则在下一轮对话中，之前轮输出的思维链内容不会被拼接到上下文中。



### 样例代码

下面的代码以 Python 语言为例，展示了如何访问思维链和最终回答，以及如何在多轮对话中进行上下文拼接。

**非流式**

```python
from openai import OpenAI
client = OpenAI(api_key="<DeepSeek API Key>", base_url="https://api.deepseek.com")

# Turn 1
messages = [{"role": "user", "content": "9.11 and 9.8, which is greater?"}]
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=messages,
    reasoning_effort="high"
    extra_body={"thinking": {"type": "enabled"}},
)

reasoning_content = response.choices[0].message.reasoning_content
content = response.choices[0].message.content

# Turn 2
# The reasoning_content will be ignored by the API
messages.append(response.choices[0].message)
messages.append({'role': 'user', 'content': "How many Rs are there in the word 'strawberry'?"})
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=messages,
    reasoning_effort="high"
    extra_body={"thinking": {"type": "enabled"}},
)
# ...
```

**流式**

```python
from openai import OpenAI
client = OpenAI(api_key="<DeepSeek API Key>", base_url="https://api.deepseek.com")

# Turn 1
messages = [{"role": "user", "content": "9.11 and 9.8, which is greater?"}]
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=messages,
    stream=True,
    reasoning_effort="high"
    extra_body={"thinking": {"type": "enabled"}},
)

reasoning_content = ""
content = ""

for chunk in response:
    if chunk.choices[0].delta.reasoning_content:
        reasoning_content += chunk.choices[0].delta.reasoning_content
    else:
        content += chunk.choices[0].delta.content

# Turn 2
# The reasoning_content will be ignored by the API
messages.append({"role": "assistant", "reasoning_content": reasoning_content, "content": content})
messages.append({'role': 'user', 'content': "How many Rs are there in the word 'strawberry'?"})
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=messages,
    stream=True,
    reasoning_effort="high"
    extra_body={"thinking": {"type": "enabled"}},
)
# ...
```

### 工具调用

DeepSeek 模型的思考模式支持工具调用功能。模型在输出最终答案之前，可以进行多轮的思考与工具调用，以提升答案的质量。

请注意，区别于思考模式下的未进行工具调用的轮次，进行了工具调用的轮次，在后续所有请求中，必须完整回传 `reasoning_content` 给 API。

若您的代码中未正确回传 `reasoning_content`，API 会返回 400 报错。正确回传方法请您参考下面的样例代码。

### 样例代码

下面是一个简单的在思考模式下进行工具调用的样例代码：

```python
import os
import json
from openai import OpenAI
from datetime import datetime

# The definition of the tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_date",
            "description": "Get the current date",
            "parameters": { "type": "object", "properties": {} },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather of a location, the user should supply the location and date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": { "type": "string", "description": "The city name" },
                    "date": { "type": "string", "description": "The date in format YYYY-mm-dd" },
                },
                "required": ["location", "date"]
            },
        }
    },
]

# The mocked version of the tool calls
def get_date_mock():
    return datetime.now().strftime("%Y-%m-%d")

def get_weather_mock(location, date):
    return "Cloudy 7~13°C"

TOOL_CALL_MAP = {
    "get_date": get_date_mock,
    "get_weather": get_weather_mock
}

def run_turn(turn, messages):
    sub_turn = 1
    while True:
        response = client.chat.completions.create(
            model='deepseek-v4-pro',
            messages=messages,
            tools=tools,
            reasoning_effort="high",
            extra_body={ "thinking": { "type": "enabled" } },
        )
        messages.append(response.choices[0].message)
        reasoning_content = response.choices[0].message.reasoning_content
        content = response.choices[0].message.content
        tool_calls = response.choices[0].message.tool_calls
        print(f"Turn {turn}.{sub_turn}\n{reasoning_content=}\n{content=}\n{tool_calls=}")
        # If there is no tool calls, then the model should get a final answer and we need to stop the loop
        if tool_calls is None:
            break
        for tool in tool_calls:
            tool_function = TOOL_CALL_MAP[tool.function.name]
            tool_result = tool_function(**json.loads(tool.function.arguments))
            print(f"tool result for {tool.function.name}: {tool_result}\n")
            messages.append({
                "role": "tool",
                "tool_call_id": tool.id,
                "content": tool_result,
            })
        sub_turn += 1
    print()

client = OpenAI(
    api_key=os.environ.get('DEEPSEEK_API_KEY'),
    base_url=os.environ.get('DEEPSEEK_BASE_URL'),
)

# The user starts a question
turn = 1
messages = [{
    "role": "user",
    "content": "How's the weather in Hangzhou Tomorrow"
}]
run_turn(turn, messages)

# The user starts a new question
turn = 2
messages.append({
    "role": "user",
    "content": "How's the weather in Guangzhou Tomorrow"
})
run_turn(turn, messages)
```

在 Turn 1 的每个子请求中，都携带了该 Turn 下产生的 `reasoning_content` 给 API，从而让模型继续之前的思考。`response.choices[0].message` 携带了 `assistant` 消息的所有必要字段，包括 `content`、`reasoning_content`、`tool_calls`。简单起见，可以直接用如下代码将消息 append 到 messages 结尾：

```text
messages.append(response.choices[0].message)
```

这行代码等价于：

```text
messages.append({
    'role': 'assistant',
    'content': response.choices[0].message.content,
    'reasoning_content': response.choices[0].message.reasoning_content,
    'tool_calls': response.choices[0].message.tool_calls,
})
```

且在 Turn 2 的请求中，我们仍然携带着 Turn1 所产生的 `reasoning_content` 给 API。

该代码的样例输出如下：

```bash
Turn 1.1
reasoning_content="The user is asking about the weather in Hangzhou tomorrow. I need to get tomorrow's date first, then call the weather function."
content="Let me check tomorrow's weather in Hangzhou for you. First, let me get tomorrow's date."
tool_calls=[ChatCompletionMessageFunctionToolCall(id='call_00_kw66qNnNto11bSfJVIdlV5Oo', function=Function(arguments='{}', name='get_date'), type='function', index=0)]
tool result for get_date: 2026-04-19

Turn 1.2
reasoning_content="Today is 2026-04-19, so tomorrow is 2026-04-20. Now I'll call the weather function for Hangzhou."
content=''
tool_calls=[ChatCompletionMessageFunctionToolCall(id='call_00_H2SCW6136vWJGq9SQlBuhVt4', function=Function(arguments='{"location": "Hangzhou", "date": "2026-04-20"}', name='get_weather'), type='function', index=0)]
tool result for get_weather: Cloudy 7~13°C

Turn 1.3
reasoning_content='The weather result is in. Let me share this with the user.'
content="Here's the weather forecast for **Hangzhou tomorrow (April 20, 2026)**:\n\n- 🌤 **Condition:** Cloudy  \n- 🌡 **Temperature:** 7°C ~ 13°C (45°F ~ 55°F)\n\nIt'll be on the cooler side, so you might want to bring a light jacket if you're heading out! Let me know if you need anything else."
tool_calls=None

Turn 2.1
reasoning_content='The user is asking about the weather in Guangzhou tomorrow. Today is 2026-04-19, so tomorrow is 2026-04-20. I can directly call the weather function.'
content=''
tool_calls=[ChatCompletionMessageFunctionToolCall(id='call_00_8URkLt5NjmNkVKhDmMcNq9Mo', function=Function(arguments='{"location": "Guangzhou", "date": "2026-04-20"}', name='get_weather'), type='function', index=0)]
tool result for get_weather: Cloudy 7~13°C

Turn 2.2
reasoning_content='The weather result for Guangzhou is the same as Hangzhou. Let me share this with the user.'
content="Here's the weather forecast for **Guangzhou tomorrow (April 20, 2026)**:\n\n- 🌤 **Condition:** Cloudy  \n- 🌡 **Temperature:** 7°C ~ 13°C (45°F ~ 55°F)\n\nIt'll be cool and cloudy, so a light jacket would be a good idea if you're going out. Let me know if there's anything else you'd like to know!"
tool_calls=None
```



## 2.2 多轮对话

本指南将介绍如何使用 DeepSeek `/chat/completions` API 进行多轮对话。

DeepSeek `/chat/completions` API 是一个“无状态” API，即服务端不记录用户请求的上下文，用户在每次请求时，**需将之前所有对话历史拼接好后**，传递给对话 API。

下面的代码以 Python 语言，展示了如何进行上下文拼接，以实现多轮对话。

```python
from openai import OpenAI
client = OpenAI(api_key="<DeepSeek API Key>", base_url="https://api.deepseek.com")

# Round 1
messages = [{"role": "user", "content": "What's the highest mountain in the world?"}]
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=messages
)

messages.append(response.choices[0].message)
print(f"Messages Round 1: {messages}")

# Round 2
messages.append({"role": "user", "content": "What is the second?"})
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=messages
)

messages.append(response.choices[0].message)
print(f"Messages Round 2: {messages}")
```

在**第一轮**请求时，传递给 API 的 `messages` 为：

```json
[
    {"role": "user", "content": "What's the highest mountain in the world?"}
]
```

在**第二轮**请求时：

1. 要将第一轮中模型的输出添加到 `messages` 末尾
2. 将新的提问添加到 `messages` 末尾

最终传递给 API 的 `messages` 为：

```json
[
    {"role": "user", "content": "What's the highest mountain in the world?"},
    {"role": "assistant", "content": "The highest mountain in the world is Mount Everest."},
    {"role": "user", "content": "What is the second?"}
]
```



## 2.3 对话前缀续写（Beta）

对话前缀续写沿用 [Chat Completion API](https://api-docs.deepseek.com/zh-cn/api/create-chat-completion)，用户提供 assistant 开头的消息，来让模型补全其余的消息。

### 注意事项

1. 使用对话前缀续写时，用户需确保 `messages` 列表里最后一条消息的 `role` 为 `assistant`，并设置最后一条消息的 `prefix` 参数为 `True`。
2. 用户需要设置 `base_url="https://api.deepseek.com/beta"` 来开启 Beta 功能。

### 样例代码

下面给出了对话前缀续写的完整 Python 代码样例。在这个例子中，我们设置 `assistant` 开头的消息为 `"```python\n"` 来强制模型输出 python 代码，并设置 `stop` 参数为 `['```']` 来避免模型的额外解释。

```python
from openai import OpenAI

client = OpenAI(
    api_key="<your api key>",
    base_url="https://api.deepseek.com/beta",
)

messages = [
    {"role": "user", "content": "Please write quick sort code"},
    {"role": "assistant", "content": "```python\n", "prefix": True}
]
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=messages,
    stop=["```"],
)
print(response.choices[0].message.content)
```



## 2.4 FIM 补全（Beta）

在 [FIM (Fill In the Middle) 补全](https://api-docs.deepseek.com/zh-cn/api/create-completion)中，用户可以提供前缀和后缀（可选），模型来补全中间的内容。FIM 常用于内容续写、代码补全等场景。

### 注意事项

1. 模型的最大补全长度为 4K。
2. 用户需要设置 `base_url="https://api.deepseek.com/beta"` 来开启 Beta 功能。

### 样例代码

下面给出了 FIM 补全的完整 Python 代码样例。在这个例子中，我们给出了计算斐波那契数列函数的开头和结尾，来让模型补全中间的内容。

```python
from openai import OpenAI

client = OpenAI(
    api_key="<your api key>",
    base_url="https://api.deepseek.com/beta",
)

response = client.completions.create(
    model="deepseek-v4-pro",
    prompt="def fib(a):",
    suffix="    return fib(a-1) + fib(a-2)",
    max_tokens=128
)
print(response.choices[0].text)
```

### 配置 Continue 代码补全插件

[Continue](https://continue.dev/) 是一款支持代码补全的 VSCode 插件，您可以参考[这篇文档](https://github.com/deepseek-ai/awesome-deepseek-integration/blob/main/docs/continue/README_cn.md)来配置 Continue 以使用代码补全功能。



## 2.5 JSON Output

在很多场景下，用户需要让模型严格按照 JSON 格式来输出，以实现输出的结构化，便于后续逻辑进行解析。

DeepSeek 提供了 JSON Output 功能，来确保模型输出合法的 JSON 字符串。

### 注意事项

1. 设置 `response_format` 参数为 `{'type': 'json_object'}`。
2. 用户传入的 system 或 user prompt 中必须含有 `json` 字样，并给出希望模型输出的 JSON 格式的样例，以指导模型来输出合法 JSON。
3. 需要合理设置 `max_tokens` 参数，防止 JSON 字符串被中途截断。
4. **在使用 JSON Output 功能时，API 有概率会返回空的 content。我们正在积极优化该问题，您可以尝试修改 prompt 以缓解此类问题。**

### 样例代码

这里展示了使用 JSON Output 功能的完整 Python 代码：

```python
import json
from openai import OpenAI

client = OpenAI(
    api_key="<your api key>",
    base_url="https://api.deepseek.com",
)

system_prompt = """
The user will provide some exam text. Please parse the "question" and "answer" and output them in JSON format. 

EXAMPLE INPUT: 
Which is the highest mountain in the world? Mount Everest.

EXAMPLE JSON OUTPUT:
{
    "question": "Which is the highest mountain in the world?",
    "answer": "Mount Everest"
}
"""

user_prompt = "Which is the longest river in the world? The Nile River."

messages = [{"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}]

response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=messages,
    response_format={
        'type': 'json_object'
    }
)

print(json.loads(response.choices[0].message.content))
```

模型将会输出：

```text
{
    "question": "Which is the longest river in the world?",
    "answer": "The Nile River"
}
```



## 2.6 Tool Calls

Tool Calls 让模型能够调用外部工具，来增强自身能力。

------

### 非思考模式

#### 样例代码

这里以获取用户当前位置的天气信息为例，展示了使用 Tool Calls 的完整 Python 代码。

Tool Calls 的具体 API 格式请参考[对话补全](https://api-docs.deepseek.com/zh-cn/api/create-chat-completion/)文档。

```python
from openai import OpenAI

def send_messages(messages):
    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        messages=messages,
        tools=tools
    )
    return response.choices[0].message

client = OpenAI(
    api_key="<your api key>",
    base_url="https://api.deepseek.com",
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather of a location, the user should supply a location first.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    }
                },
                "required": ["location"]
            },
        }
    },
]

messages = [{"role": "user", "content": "How's the weather in Hangzhou, Zhejiang?"}]
message = send_messages(messages)
print(f"User>\t {messages[0]['content']}")

tool = message.tool_calls[0]
messages.append(message)

messages.append({"role": "tool", "tool_call_id": tool.id, "content": "24℃"})
message = send_messages(messages)
print(f"Model>\t {message.content}")
```



这个例子的执行流程如下：

1. 用户：询问现在的天气
2. 模型：返回 function `get_weather({location: 'Hangzhou'})`
3. 用户：调用 function `get_weather({location: 'Hangzhou'})`，并传给模型。
4. 模型：返回自然语言，"The current temperature in Hangzhou is 24°C."

注：上述代码中 `get_weather` 函数功能需由用户提供，模型本身不执行具体函数。

------

### 思考模式

从 DeepSeek-V3.2 开始，API 支持了思考模式下的工具调用能力，详见[思考模式](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode#工具调用)。

------

#### `strict` 模式（Beta）

在 `strict` 模式下，模型在输出 Function 调用时会严格遵循 Function 的 JSON Schema 的格式要求，以确保模型输出的 Function 符合用户的定义。在思考与非思考模式下的工具调用，均可使用 `strict` 模式。

要使用 `strict` 模式，需要：

1. 用户需要设置 `base_url="https://api.deepseek.com/beta"` 来开启 Beta 功能
2. 在传入的 `tools` 列表中，所有 `function` 均需设置 `strict` 属性为 `true`
3. 服务端会对用户传入的 Function 的 JSON Schema 进行校验，如不符合规范，或遇到服务端不支持的 JSON Schema 类型，将返回错误信息

以下是 `strict` 模式下 tool 的定义样例：

```json
{
    "type": "function",
    "function": {
        "name": "get_weather",
        "strict": true,
        "description": "Get weather of a location, the user should supply a location first.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g. San Francisco, CA",
                }
            },
            "required": ["location"],
            "additionalProperties": false
        }
    }
}
```



------

##### `strict` 模式支持的 JSON Schema 类型

- object
- string
- number
- integer
- boolean
- array
- enum
- anyOf

------

##### object 类型

object 定义一个包含键值对的深层结构，其中 properties 定义了对象中每个键（属性）的 schema。**每个 `object` 的所有属性均需设置为 `required`，且 `object` 中 `additionalProperties` 属性必须为 `false`**。

示例：

```json
{
    "type": "object",
    "properties": {
        "name": { "type": "string" },
        "age": { "type": "integer" }
    },
    "required": ["name", "age"],
    "additionalProperties": false
}
```



------

##### string 类型

- 支持的参数：
  - pattern：使用正则表达式来约束字符串的格式
  - format：使用预定义的常见格式进行校验，目前支持：
    - email：电子邮件地址
    - hostname：主机名
    - ipv4：IPv4 地址
    - ipv6：IPv6 地址
    - uuid：uuid
- 不支持的参数
  - minLength
  - maxLength

示例：

```json
{
    "type": "object",
    "properties": {
        "user_email": {
            "type": "string",
            "description": "The user's email address",
            "format": "email" 
        },
        "zip_code": {
            "type": "string",
            "description": "Six digit postal code",
            "pattern": "^\\d{6}$"
        }
    }
}
```



------

##### number/integer 类型

- 支持的参数
  - const：固定数字为常数
  - default：数字的默认值
  - minimum：最小值
  - maximum：最大值
  - exclusiveMinimum：不小于
  - exclusiveMaximum：不大于
  - multipleOf：数字输出为这个值的倍数

示例：

```json
{
    "type": "object",
    "properties": {
        "score": {
            "type": "integer",
            "description": "A number from 1-5, which represents your rating, the higher, the better",
            "minimum": 1,
            "maximum": 5
        }
    },
    "required": ["score"],
    "additionalProperties": false
}
```



------

##### array 类型

- 不支持的参数
  - minItems
  - maxItems

示例：

```json
{
    "type": "object",
    "properties": {
        "keywords": {
            "type": "array",
            "description": "Five keywords of the article, sorted by importance",
            "items": {
                "type": "string",
                "description": "A concise and accurate keyword or phrase."
            }
        }
    },
    "required": ["keywords"],
    "additionalProperties": false
}
```



------

##### enum

enum 可以确保输出是预期的几个选项之一，例如在订单状态的场景下，只能是有限几个状态之一。

样例：

```json
{
    "type": "object",
    "properties": {
        "order_status": {
            "type": "string",
            "description": "Ordering status",
            "enum": ["pending", "processing", "shipped", "cancelled"]
        }
    }
}
```



------

##### anyOf

匹配所提供的多个 schema 中的任意一个，可以处理可能具有多种有效格式的字段，例如用户的账户可能是邮箱或者手机号中的一个：

```json
{
    "type": "object",
    "properties": {
    "account": {
        "anyOf": [
            { "type": "string", "format": "email", "description": "可以是电子邮件地址" },
            { "type": "string", "pattern": "^\\d{11}$", "description": "或11位手机号码" }
        ]
    }
  }
}
```



------

##### $ref 和 $def

可以使用 $def 定义模块，再用 $ref 引用以减少模式的重复和模块化，此外还可以单独使用 $ref 定义递归结构。

```json
{
    "type": "object",
    "properties": {
        "report_date": {
            "type": "string",
            "description": "The date when the report was published"
        },
        "authors": {
            "type": "array",
            "description": "The authors of the report",
            "items": {
                "$ref": "#/$def/author"
            }
        }
    },
    "required": ["report_date", "authors"],
    "additionalProperties": false,
    "$def": {
        "author": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "author's name"
                },
                "institution": {
                    "type": "string",
                    "description": "author's institution"
                },
                "email": {
                    "type": "string",
                    "format": "email",
                    "description": "author's email"
                }
            },
            "additionalProperties": false,
            "required": ["name", "institution", "email"]
        }
    }
}
```



## 2.7 上下文硬盘缓存

DeepSeek API 上下文硬盘缓存技术对所有用户默认开启，用户无需修改代码即可享用。

用户的每一个请求都会触发硬盘缓存的构建。若后续请求与之前的请求在前缀上存在重复，则重复部分只需要从缓存中拉取，计入“缓存命中”。

### 缓存落盘与命中规则

缓存命中的前提是相应前缀已被“落盘”（写入硬盘缓存）。受 Sliding Window Attention 机制的影响，缓存前缀的存取与判别与之前有所不同。每条缓存前缀是一个独立的完整单元。后续请求只有在完整匹配**缓存前缀单元**时，才能命中缓存。

#### 缓存前缀落盘时机：

1. **请求结束位置落盘**：每次请求的**用户输入结束位置**与**模型输出结束位置**，会产生两个**缓存前缀单元**。后续请求若**完整**匹配了它们，则可命中。
2. **公共前缀检测落盘**：当系统检测到多次请求之间存在公共前缀时，会将该公共前缀作为一个独立的**缓存前缀单元**进行落盘。后续请求若**完整**复用了该**缓存前缀单元**，则可命中。
3. **按固定 token 间隔落盘**：在长输入或长输出中，系统会以一定的 token 数量为间隔，截取**缓存前缀单元**，避免长前缀因迟迟未达到结束位置而完全无法被缓存。

举例 1：用户第一轮请求内容为 `A + B`，第二轮请求内容为 `A + B + C`，则第二轮请求能完整匹配 `A + B` 这个**缓存前缀单元**，可以命中 `A + B` 的缓存。详见下文例一。

举例 2：用户第一轮请求的内容为 `A + B`，第二轮请求的内容为 `A + C`，则第二轮请求无法命中缓存，因为 `A + C` 不能完整匹配第一轮的**缓存前缀单元**（`A + B`）。但此时系统会识别到两轮请求存在公共前缀 `A`，并将 `A` 作为**缓存前缀单元**落盘。当第三轮请求 `A + D` 到来时，能完整匹配 `A` 这个**缓存前缀单元**，可以命中 `A` 的缓存。详见下文例二。

------

#### 例一：多轮对话

**第一次请求**

```json
messages: [
    {"role": "system", "content": "你是一位乐于助人的助手"},
    {"role": "user", "content": "中国的首都是哪里？"}
]
```



**第二次请求**

```json
messages: [
    {"role": "system", "content": "你是一位乐于助人的助手"},
    {"role": "user", "content": "中国的首都是哪里？"},
    {"role": "assistant", "content": "中国的首都是北京。"},
    {"role": "user", "content": "美国的首都是哪里？"}
]
```



在上例中，第二次请求可以完整复用第一次请求的**缓存前缀单元**，这部分会计入“缓存命中”。

#### 例二：长文本问答

**第一次请求**

```json
messages: [
    {"role": "system", "content": "你是一位资深的财报分析师..."}
    {"role": "user", "content": "<财报内容>\n\n请总结一下这份财报的关键信息。"}
]
```



**第二次请求**

```json
messages: [
    {"role": "system", "content": "你是一位资深的财报分析师..."}
    {"role": "user", "content": "<财报内容>\n\n请分析一下这份财报的盈利情况。"}
]
```



**第三次请求**

```json
messages: [
    {"role": "system", "content": "你是一位资深的财报分析师..."}
    {"role": "user", "content": "<财报内容>\n\n请分析一下公司收入与支出占比。"}
]
```



在上例中，前两次请求不会命中缓存。前两次请求完成后，系统会识别出 `system` 消息 + `user` 消息中的<财报内容>为**缓存前缀单元**，并进行落盘。在第三次请求中，由于完整匹配了前面落盘的**缓存前缀单元**，则可命中缓存。

------

### 查看缓存命中情况

在 DeepSeek API 的返回中，我们在 `usage` 字段中增加了两个字段，来反映请求的缓存命中情况：

1. `prompt_cache_hit_tokens`：本次请求的输入中，缓存命中的 tokens 数
2. `prompt_cache_miss_tokens`：本次请求的输入中，缓存未命中的 tokens 数

### 硬盘缓存与输出随机性

硬盘缓存只匹配到用户输入的前缀部分，输出仍然是通过计算推理得到的，仍然受到 temperature 等参数的影响，从而引入随机性。其输出效果与不使用硬盘缓存相同。

### 其它说明

1. 缓存系统是“尽力而为”，不保证 100% 缓存命中
2. 缓存构建耗时为秒级。缓存不再使用后会自动被清空，时间一般为几个小时到几天



## 2.8 Anthropic API

为了满足大家对 Anthropic API 生态的使用需求，我们的 API 新增了对 Anthropic API 格式的支持，其 `base_url` 为 `https://api.deepseek.com/anthropic`。

通过简单的配置，即可将 DeepSeek 的能力，接入到 Anthropic API 生态中。

### 将 DeepSeek 模型接入 Claude Code

请参考[接入 Agent 工具](https://api-docs.deepseek.com/zh-cn/guides/coding_agents)

### 通过 Anthropic API 调用 DeepSeek 模型

1. 安装 Anthropic SDK

```shell
pip install anthropic
```



1. 配置环境变量

```shell
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_API_KEY=${YOUR_API_KEY}
```



1. 调用 API

```python
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="deepseek-v4-pro",
    max_tokens=1000,
    system="You are a helpful assistant.",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Hi, how are you?"
                }
            ]
        }
    ]
)
print(message.content)
```



**注意**：当您给 DeepSeek 的 Anthropic API 传入不支持的模型名时，API 后端会自动将其映射到 `deepseek-v4-flash` 模型。

------

### Anthropic 模型映射

您在使用 Anthropic API 时，我们会对您传入的 claude 模型名进行映射：

- claude-opus 开头的模型，会映射到 deepseek-v4-pro
- claude-haiku、claude-sonnet 开头的模型，会映射到 deepseek-v4-flash

通过这样的映射，您在使用新版 Claude Desktop APP 的 developer 模式时，可以绕过 APP 对模型名的限制，只需改动 base_url 和 api_key，即可在其中接入 DeepSeek 模型。

### Anthropic API 兼容性细节

#### HTTP Header

| Field             | Support Status  |
| ----------------- | --------------- |
| anthropic-beta    | Ignored         |
| anthropic-version | Ignored         |
| x-api-key         | Fully Supported |

#### Simple Fields

| Field          | Support Status                                               |
| -------------- | ------------------------------------------------------------ |
| model          | Use DeepSeek Model Instead                                   |
| max_tokens     | Fully Supported                                              |
| container      | Ignored                                                      |
| mcp_servers    | Ignored                                                      |
| metadata       | `user_id` is supported, others are ignored Please refer to [Rate Limit & Isolation](https://api-docs.deepseek.com/zh-cn/quick_start/rate_limit) for more information about `user_id` parameter. |
| service_tier   | Ignored                                                      |
| stop_sequences | Fully Supported                                              |
| stream         | Fully Supported                                              |
| system         | Fully Supported                                              |
| temperature    | Fully Supported (range [0.0 ~ 2.0])                          |
| thinking       | Supported (`budget_tokens` is ignored)                       |
| output_config  | Only `effort` is supported                                   |
| top_k          | Ignored                                                      |
| top_p          | Fully Supported                                              |

#### Tool Fields

##### tools

| Field         | Support Status  |
| ------------- | --------------- |
| name          | Fully Supported |
| input_schema  | Fully Supported |
| description   | Fully Supported |
| cache_control | Ignored         |

##### tool_choice

| Value | Support Status                                     |
| ----- | -------------------------------------------------- |
| none  | Fully Supported                                    |
| auto  | Supported (`disable_parallel_tool_use` is ignored) |
| any   | Supported (`disable_parallel_tool_use` is ignored) |
| tool  | Supported (`disable_parallel_tool_use` is ignored) |

#### Message Fields

<table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; border: 1px solid #e1e4e8;">
  <thead>
    <tr style="background-color: #f6f8fa; border-bottom: 2px solid #e1e4e8;">
      <th style="padding: 10px; text-align: left; font-weight: 600; border-right: 1px solid #e1e4e8; width: 12%;">Field</th>
      <th style="padding: 10px; text-align: left; font-weight: 600; border-right: 1px solid #e1e4e8; width: 38%;">Variant</th>
      <th style="padding: 10px; text-align: left; font-weight: 600; border-right: 1px solid #e1e4e8; width: 25%;">Sub-Field</th>
      <th style="padding: 10px; text-align: left; font-weight: 600; width: 25%;">Support Status</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td rowspan="23" style="padding: 10px; vertical-align: top; font-weight: 500; border-right: 1px solid #e1e4e8; background-color: #fafbfc;">content</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">string</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #28a745; font-weight: 500;">Fully Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td rowspan="3" style="padding: 10px; border-right: 1px solid #e1e4e8; vertical-align: top;">array, type="text"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">text</td>
      <td style="padding: 10px; color: #28a745; font-weight: 500;">Fully Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">cache_control</td>
      <td style="padding: 10px; color: #6a737d;">Ignored</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">citations</td>
      <td style="padding: 10px; color: #6a737d;">Ignored</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type="image"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #cb2431;">Not Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type = "document"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #cb2431;">Not Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type = "search_result"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #cb2431;">Not Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type = "thinking"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #22863a;">Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type="redacted_thinking"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #cb2431;">Not Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td rowspan="4" style="padding: 10px; border-right: 1px solid #e1e4e8; vertical-align: top;">array, type = "tool_use"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">id</td>
      <td style="padding: 10px; color: #28a745; font-weight: 500;">Fully Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">input</td>
      <td style="padding: 10px; color: #28a745; font-weight: 500;">Fully Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">name</td>
      <td style="padding: 10px; color: #28a745; font-weight: 500;">Fully Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">cache_control</td>
      <td style="padding: 10px; color: #6a737d;">Ignored</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td rowspan="4" style="padding: 10px; border-right: 1px solid #e1e4e8; vertical-align: top;">array, type = "tool_result"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">tool_use_id</td>
      <td style="padding: 10px; color: #28a745; font-weight: 500;">Fully Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">content</td>
      <td style="padding: 10px; color: #28a745; font-weight: 500;">Fully Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">cache_control</td>
      <td style="padding: 10px; color: #6a737d;">Ignored</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">is_error</td>
      <td style="padding: 10px; color: #6a737d;">Ignored</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type = "server_tool_use"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #22863a;">Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type = "web_search_tool_result"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #22863a;">Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type = "code_execution_tool_result"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #cb2431;">Not Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type = "mcp_tool_use"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #cb2431;">Not Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type = "mcp_tool_result"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #cb2431;">Not Supported</td>
    </tr>
    <tr style="border-bottom: 1px solid #e1e4e8;">
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;">array, type = "container_upload"</td>
      <td style="padding: 10px; border-right: 1px solid #e1e4e8;"><span style="color: #959da5;">—</span></td>
      <td style="padding: 10px; color: #cb2431;">Not Supported</td>
    </tr>
  </tbody>
</table>



# 三、API 文档

## 3.1 Deepseek API

使用 DeepSeek API 之前，请先 [创建 API 密钥](https://platform.deepseek.com/api_keys)。

### Authentication

**HTTP: Bearer Auth**

| Security Scheme Type | HTTP Authorization Scheme |
| -------------------- | ------------------------- |
| http                 | bearer                    |

### Contact

DeepSeek 技术支持: [api-service@deepseek.com](mailto:api-service@deepseek.com)

### Terms of Service

https://cdn.deepseek.com/policies/zh-CN/deepseek-open-platform-terms-of-service.html

### License

[MIT](https://opensource.org/license/mit/)



## 3.2 对话补全

接口描述：根据输入的上下文，来让模型补全对话内容。

请求方法：POST

请求地址：https://api.deepseek.com/chat/completions

请求格式：**application/json**

请求示例：

```shell
curl -L -X POST 'https://api.deepseek.com/chat/completions' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer <TOKEN>' \
--data-raw '{
  "messages": [
    {
      "content": "You are a helpful assistant",
      "role": "system"
    },
    {
      "content": "你好",
      "role": "user"
    }
  ],
  "model": "deepseek-v4-pro",
  "thinking": {
    "type": "enabled"
  },
  "reasoning_effort": "high",
  "max_tokens": 4096,
  "response_format": {
    "type": "text"
  },
  "stop": null,
  "stream": false,
  "stream_options": null,
  "temperature": 1,
  "top_p": 1,
  "tools": null,
  "tool_choice": "none",
  "logprobs": false,
  "top_logprobs": null
}'
```

响应示例：

```json
{
  "id": "d71218a1-6539-49fd-bbc7-02cc9923b0c7",
  "object": "chat.completion",
  "created": 1781272346,
  "model": "deepseek-v4-pro",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！很高兴见到你！😊\n\n我是DeepSeek，一个由深度求索公司创造的AI助手，随时准备为你提供帮助。无论你想聊聊天、问问题、需要写作协助，还是想处理文件、进行编程、查找信息，我都很乐意帮忙！\n\n有什么我可以为你做的吗？",
        "reasoning_content": "嗯，用户发来一句简单的问候“你好”。\n\n这是一个非常基础的社交开场，没有提出具体问题或指令。\n\n我需要用友好、热情的语气回应，可以做一个简单的自我介绍，并表达我乐于提供帮助的意愿，这样能引导对话继续。\n\n想到了用“很高兴见到你”加上表情符号来传递积极情绪，然后说明我的身份和功能。"
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 139,
    "total_tokens": 149,
    "prompt_tokens_details": {
      "cached_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 74
    },
    "prompt_cache_hit_tokens": 0,
    "prompt_cache_miss_tokens": 10
  },
  "system_fingerprint": "fp_9954b31ca7_prod0820_fp8_kvcache_20260402"
}
```

响应参数说明：

| **参数路径**                                       | **类型**     | **是否必填** | **原始描述**                                                 |
| -------------------------------------------------- | ------------ | ------------ | ------------------------------------------------------------ |
| **`id`**                                           | string       | **REQUIRED** | 该对话补全的唯一标识符。                                     |
| **`choices`**                                      | array        | **REQUIRED** | 模型生成的补全选项列表。                                     |
| `choices[].finish_reason`                          | string       | **REQUIRED** | 模型停止生成 token 的原因。 可能的值包含： • `stop`：模型自然结束，或遇到了停止词。 • `length`：达到了请求参数中设置的 `max_tokens` 或者模型的最大上下文长度。 • `content_filter`：因内容过滤策略而被拦截。 • `tool_calls`：模型决定调用外部工具。 • `insufficient_system_resource`：系统资源不足导致生成中断。 |
| `choices[].index`                                  | integer      | **REQUIRED** | 该选项在 choices 列表中的索引（从 0 开始）。                 |
| `choices[].message`                                | object       | **REQUIRED** | 模型生成的 message 对象。                                    |
| `choices[].message.content`                        | string\|null | **REQUIRED** | 该 completion 的内容。                                       |
| `choices[].message.reasoning_content`              | string\|null | 可选         | 模型思考过程的内容。                                         |
| `choices[].message.role`                           | string       | **REQUIRED** | 产生该 message 的角色，其值始终为 `assistant`。              |
| `choices[].logprobs`                               | object\|null | **REQUIRED** | 该选项的对数概率信息。                                       |
| `choices[].logprobs.content`                       | array\|null  | **REQUIRED** | 一个包含消息文本 token 对数概率信息的列表。                  |
| `choices[].logprobs.reasoning_content`             | array\|null  | 可选         | 一个包含推理文本 token 对数概率信息的列表。                  |
| **`created`**                                      | integer      | **REQUIRED** | 创建对话补全时的 Unix 时间戳（秒）。                         |
| **`model`**                                        | string       | **REQUIRED** | 产生该补全的模型名称。                                       |
| **`system_fingerprint`**                           | string       | **REQUIRED** | 该指纹代表模型运行的基础配置。配合同样的请求，该指纹可以帮助您识别模型后端的更改。 |
| **`object`**                                       | string       | **REQUIRED** | 对象的类型，其值始终为 `chat.completion`。                   |
| **`usage`**                                        | object       | **REQUIRED** | 该补全请求的 token 使用统计。                                |
| `usage.completion_tokens`                          | integer      | **REQUIRED** | 模型生成的 completion 消耗的 token 数。                      |
| `usage.prompt_tokens`                              | integer      | **REQUIRED** | 输入 prompt 消耗的 token 数。包含 `prompt_cache_hit_tokens` 和 `prompt_cache_miss_tokens`。 |
| `usage.prompt_cache_hit_tokens`                    | integer      | **REQUIRED** | 命中缓存的 prompt token 数。                                 |
| `usage.prompt_cache_miss_tokens`                   | integer      | **REQUIRED** | 未命中缓存的 prompt token 数。                               |
| `usage.total_tokens`                               | integer      | **REQUIRED** | 消耗的总 token 数（prompt + completion）。                   |
| `usage.completion_tokens_details`                  | object       | **REQUIRED** | completion token 的详细拆解。                                |
| `usage.completion_tokens_details.reasoning_tokens` | integer      | **REQUIRED** | 模型输出内容中推理过程消耗的 token 数量。                    |

NodeJS **代码示例**

```javascript
import OpenAI from "openai";

# for backward compatibility, you can still use `https://api.deepseek.com/v1` as `baseURL`.
const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: '<your API key>'
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-v4-pro",
  });

  console.log(completion.choices[0].message.content);
}

main();
```

**Axios 请求代码示例**

```javascript
const axios = require('axios');
let data = JSON.stringify({
  "messages": [
    {
      "content": "You are a helpful assistant",
      "role": "system"
    },
    {
      "content": "Hi",
      "role": "user"
    }
  ],
  "model": "deepseek-v4-pro",
  "thinking": {
    "type": "enabled"
  },
  "reasoning_effort": "high",
  "max_tokens": 4096,
  "response_format": {
    "type": "text"
  },
  "stop": null,
  "stream": false,
  "stream_options": null,
  "temperature": 1,
  "top_p": 1,
  "tools": null,
  "tool_choice": "none",
  "logprobs": false,
  "top_logprobs": null
});

let config = {
  method: 'post',
maxBodyLength: Infinity,
  url: 'https://api.deepseek.com/chat/completions',
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'Authorization': 'Bearer <TOKEN>'
  },
  data : data
};

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});	
```





## 3.3 FIM 补全（Beta）

接口描述：FIM（Fill-In-the-Middle）补全 API。用户需要设置 `base_url="https://api.deepseek.com/beta"` 来使用此功能。

请求方法：POST

请求地址：https://api.deepseek.com/beta/completions

请求示例：

```json
curl -L -X POST 'https://api.deepseek.com/beta/completions' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer <TOKEN>' \
--data-raw '{
  "model": "deepseek-v4-pro",
  "prompt": "Once upon a time, ",
  "echo": false,
  "logprobs": 0,
  "max_tokens": 1024,
  "stop": null,
  "stream": false,
  "stream_options": null,
  "suffix": null,
  "temperature": 1,
  "top_p": 1
}'
```

响应示例：

```json
{
  "id": "string",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "logprobs": {
        "text_offset": [
          0
        ],
        "token_logprobs": [
          0
        ],
        "tokens": [
          "string"
        ],
        "top_logprobs": [
          {}
        ]
      },
      "text": "string"
    }
  ],
  "created": 0,
  "model": "string",
  "system_fingerprint": "string",
  "object": "text_completion",
  "usage": {
    "completion_tokens": 0,
    "prompt_tokens": 0,
    "prompt_cache_hit_tokens": 0,
    "prompt_cache_miss_tokens": 0,
    "total_tokens": 0,
    "completion_tokens_details": {
      "reasoning_tokens": 0
    }
  }
}
```



## 3.4 列出模型

接口描述：列出可用的模型列表，并提供相关模型的基本信息。请前往[模型 & 价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing)查看当前支持的模型列表

请求方法：GET

请求地址：https://api.deepseek.com/models

请求示例：

```sh
curl -L -X GET 'https://api.deepseek.com/models' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer <TOKEN>'
```



响应示例：

```json
{
  "object": "list",
  "data": [
    {
      "id": "deepseek-v4-flash",
      "object": "model",
      "owned_by": "deepseek"
    },
    {
      "id": "deepseek-v4-pro",
      "object": "model",
      "owned_by": "deepseek"
    }
  ]
}
```

响应参数说明：

| 参数名称            | 参数类型 | 参数描述                                                     |
| ------------------- | -------- | ------------------------------------------------------------ |
| **object**          | string   | **Possible values:** [`list`]                                |
| **data**            | Model[]  |                                                              |
| **data[].id**       | string   | 模型的标识符                                                 |
| **data[].object**   | string   | **Possible values:** [`model`]<br />对象的类型，其值为 `model`。 |
| **data[].owned_by** | string   | 拥有该模型的组织。                                           |

**NodeJS 代码示例**

```javascript
import OpenAI from "openai";

# for backward compatibility, you can still use `https://api.deepseek.com/v1` as `baseURL`.
const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: '<your API key>'
});

async function main() {
  const models = await openai.models.list()
  for await (const model of models) {
    console.log(model);
  }
}

main();
```

**Axios 请求代码示例**

```javascript
const axios = require('axios');

let config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://api.deepseek.com/models',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Bearer <TOKEN>'
  }
};

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```



## 3.5 查询余额

接口描述：查询账号余额

请求方法：GET

请求地址：https://api.deepseek.com/user/balance

请求示例：

```sh
curl -L -X GET 'https://api.deepseek.com/user/balance' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer <TOKEN>'
```

响应示例：

```json
{
  "is_available": true,
  "balance_infos": [
    {
      "currency": "CNY",
      "total_balance": "2.30",
      "granted_balance": "0.00",
      "topped_up_balance": "2.30"
    }
  ]
}
```

响应参数说明：

| 参数名称                              | 参数类型 | 参数描述                                                    |
| ------------------------------------- | -------- | ----------------------------------------------------------- |
| **is_available**                      | boolean  | 当前账户是否有余额可供 API 调用                             |
| **balance_infos**                     | object[] |                                                             |
| **balance_infos[].currency**          | string   | **Possible values:** [`CNY`, `USD`]<br />货币，人民币或美元 |
| **balance_infos[].total_balance**     | string   | 总的可用余额，包括赠金和充值余额                            |
| **balance_infos[].granted_balance**   | string   | 未过期的赠金余额                                            |
| **balance_infos[].topped_up_balance** | string   | 充值余额                                                    |

**Axios 请求代码示例**

```javascript
const axios = require('axios');

let config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://api.deepseek.com/user/balance',
  headers: { 
    'Accept': 'application/json', 
    'Authorization': 'Bearer <TOKEN>'
  }
};

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```

