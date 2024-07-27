---
title: JWT令牌
createTime: 2024/07/27 15:45:00
author: 路白榆
tags:
  - 令牌生成
  - 统一校验
permalink: /article/vqy9r8u1/
---

### JWT令牌

#### 创建JWT令牌

代码示例：

创建令牌工具类：

```java
package com.by.common.utils;

import cn.hutool.jwt.JWTPayload;
import cn.hutool.jwt.JWTUtil;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * JWT令牌工具类
 *
 * @author lzh
 */
public class JwtUtil {

    /**
     * 创建JWT令牌
     *
     * @param payload   载荷
     * @param secretKey 签名密钥
     * @return JWT令牌
     */
    public static String createToken(Map<String, Object> payload, String secretKey) {
        // 设置JWT的签发时间
        payload.put(JWTPayload.ISSUED_AT, LocalDateTime.now());
        // 设置JWT的过期时间
        payload.put(JWTPayload.EXPIRES_AT, LocalDateTime.now().plusDays(1));
        // 设置JWT的生效时间
        payload.put(JWTPayload.NOT_BEFORE, LocalDateTime.now());
        // 创建令牌
        return JWTUtil.createToken(payload, secretKey.getBytes());
    }
}
```

<br>

创建令牌

在用户登录方法添加以下代码：

```java
// 生成JWT令牌
Map<String, Object> payload = new HashMap<>(5);
// 存放用户ID
payload.put("userId", dbUser.getId());
// 存放用户角色
payload.put("role", dbUser.getUserRole());
return JwtUtil.createToken(payload, secretKey);
```

<br>

#### 校验JWT令牌

网关统一校验

代码示例：

```java
package com.by.gateway.filter;

import cn.hutool.jwt.JWT;
import cn.hutool.jwt.JWTException;
import cn.hutool.jwt.JWTPayload;
import cn.hutool.jwt.JWTUtil;
import com.by.common.utils.Result;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;


/**
 * @author lzh
 */
@Component
@Slf4j
public class MyGlobalFilter implements GlobalFilter {

    public static final String AUTHORIZATION = "Authorization";

    public static final String TOKEN_PREFIX = "Bearer";

    @Value("${jwt.encrypt.secretKey}")
    private String secretKey;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();
        HttpHeaders headers = request.getHeaders();
        // 获取请求头中的Authorization
        String authorization = headers.getFirst(AUTHORIZATION);
        String message;

        // 校验格式是否正确
        if (authorization == null || !authorization.startsWith(TOKEN_PREFIX)) {
            message = "Invalid or missing authorization header";
            log.error(message);
            return denyRequest(response, HttpStatus.UNAUTHORIZED, message);
        }

        // 获取Token
        String token = authorization.substring(TOKEN_PREFIX.length()).trim();
        if (token.isEmpty()) {
            message = "Token is empty";
            log.error(message);
            return denyRequest(response, HttpStatus.FORBIDDEN, message);
        }

        // 验证Token，判断Token是否有效
        try {
            // 判断Token是否过期以及是否正确
            JWT jwt = JWTUtil.parseToken(token);
            long expireTimeNum = Long.parseLong(jwt.getPayload(JWTPayload.EXPIRES_AT).toString());

            // 将时间戳转换为LocalDateTime
            Instant instant = Instant.ofEpochSecond(expireTimeNum);
            ZonedDateTime zonedDateTime = instant.atZone(ZoneId.systemDefault());
            LocalDateTime expireTime = zonedDateTime.toLocalDateTime();

            if (LocalDateTime.now().isAfter(expireTime) || !JWTUtil.verify(token, secretKey.getBytes())) {
                message = "Token is invalid";
                log.error(message);
                return denyRequest(response, HttpStatus.FORBIDDEN, message);
            }
        } catch (JWTException e) {
            message = "Failed to parse the token";
            log.error(message);
            return denyRequest(response, HttpStatus.FORBIDDEN, message);
        }
        return chain.filter(exchange);
    }

    /**
     * 拒绝请求
     *
     * @param response 响应体
     * @param status   响应状态
     * @param message  响应信息
     * @return Mono
     */
    public Mono<Void> denyRequest(ServerHttpResponse response, HttpStatus status, String message) {
        response.setStatusCode(status);
        // 设置响应头为JSON格式
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json;charset=UTF8");
        // 返回错误信息到客户端
        byte[] bytes;
        try {
            bytes = new ObjectMapper().writeValueAsBytes(Result.error(status.value(), message));
        } catch (JsonProcessingException e) {
            log.error("json process exception ...");
            return response.setComplete();
        }
        DataBuffer dataBuffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(dataBuffer));
    }
}
```

