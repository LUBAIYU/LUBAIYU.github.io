---
title: 微服务父项目通用配置及聚合文档配置
createTime: 2024/07/15 14:51:00
author: 路白榆
tags:
  - 微服务
  - knife4j文档
permalink: /article/nmquktab/
---

### 通用配置

#### 1.微服务配置

1.在父项目 pom.xml 文件中添加以下依赖

```xml
<properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <spring-boot.version>2.7.6</spring-boot.version>
    <spring-cloud-alibaba.version>2021.0.5.0</spring-cloud-alibaba.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-dependencies</artifactId>
        <version>2021.0.5</version>
        <type>pom</type>
        <scope>import</scope>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-loadbalancer</artifactId>
        <version>3.1.5</version>
    </dependency>
</dependencies>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-dependencies</artifactId>
            <version>${spring-cloud-alibaba.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

<br>

#### 2.Knife4J聚合文档

1.在网关模块 pom.xml 添加以下依赖

```xml
 <dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-gateway-spring-boot-starter</artifactId>
    <version>4.4.0</version>
</dependency>
```

<br>

2.在网关模块 application.yml 添加以下配置

```yaml
# knife4j配置
knife4j:
  gateway:
    enabled: true
    strategy: discover
    discover:
      enabled: true
      version: swagger2
```

<br>

3.在各个服务模块 pom.xml 中引入以下依赖

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi2-spring-boot-starter</artifactId>
    <version>4.4.0</version>
</dependency>
```

<br>

4.在各个服务模块的 application.yml 中添加以下配置

```yaml
# knife4j配置
knife4j:
  enable: true
```

<br>

5.启动网关模块和其他各模块，输入网关地址即可打开接口文档，如`localhost:8000/doc.html`

