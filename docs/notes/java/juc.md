---
title: JUC
author: 路白榆
tags:
  - Java高级技术
  - 并发编程
createTime: 2024/08/24 15:39:03
permalink: /java/ab3cd5fs/
---

### JUC（并发编程）

#### Synchronized（可重入锁）

使用`Synchronized`实现卖票案例

```java
package test.sync;

class Ticket {

    private int number = 30;

    public synchronized void sale() {
        if (number > 0) {
            System.out.println(Thread.currentThread().getName() + "卖出：" + (number--) + " 剩下：" + number + "张票");
        }
    }
}

/**
 * @author lzh
 */
public class SaleTicket {

    public static void main(String[] args) {
        Ticket ticket = new Ticket();

        new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 40; i++) {
                    ticket.sale();
                }
            }
        }, "AA").start();

        new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 40; i++) {
                    ticket.sale();
                }
            }
        }, "BB").start();

        new Thread(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 40; i++) {
                    ticket.sale();
                }
            }
        }, "CC").start();
    }
}
```

<br>

#### ReentrantLock（可重入锁）

使用`Lock`接口实现卖票示例

```java
package test.lock;

import java.util.concurrent.locks.ReentrantLock;

/**
 * @author lzh
 */
public class LTicket {

    /**
     * 票数
     */
    private int number = 30;

    /**
     * 可重入锁
     */
    private final ReentrantLock lock = new ReentrantLock(true);

    public void sale() {
        // 加锁
        lock.lock();
        try {
            if (number > 0) {
                System.out.println(Thread.currentThread().getName() + "卖出：" + (number--) + " 剩下：" + number);
            }
        } finally {
            // 解锁
            lock.unlock();
        }
    }
}
```

```java
package test.lock;

/**
 * @author lzh
 */
public class LSaleTicket {

    public static void main(String[] args) {
        LTicket ticket = new LTicket();

        new Thread(() -> {
            for (int i = 0; i < 40; i++) {
                ticket.sale();
            }
        }, "AA").start();

        new Thread(() -> {
            for (int i = 0; i < 40; i++) {
                ticket.sale();
            }
        }, "BB").start();

        new Thread(() -> {
            for (int i = 0; i < 40; i++) {
                ticket.sale();
            }
        }, "CC").start();
    }
}
```

<br>

#### 线程间通信

1.使用`Synchronized`实现线程间通信

```java
package test.sync;

/**
 * @author lzh
 */
public class Share {

    private int number = 0;

    public synchronized void incr() throws InterruptedException {
        while (number != 0) {
            this.wait();     // 进入等待
        }
        number++;
        System.out.println(Thread.currentThread().getName() + " :: " + number);
        this.notifyAll();   // 通知其他线程
    }

    public synchronized void decr() throws InterruptedException {
        while (number != 1) {
            this.wait();
        }
        number--;
        System.out.println(Thread.currentThread().getName() + " :: " + number);
        this.notifyAll();
    }
}
```

```java
package test.sync;

/**
 * @author lzh
 */
public class ThreadDemo {

    public static void main(String[] args) {
        Share share = new Share();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    share.incr();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "AA").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    share.decr();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "BB").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    share.incr();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "CC").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    share.decr();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "DD").start();
    }
}
```

<br>

2.使用`Lock`实现线程间通信

```java
package test.lock;

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * @author lzh
 */
public class Share {

    private int number = 0;

    private final Lock lock = new ReentrantLock();

    private final Condition condition = lock.newCondition();

    public void incr() throws InterruptedException {
        lock.lock();
        try {
            while (number != 0) {
                condition.await();   // 进入等待，此处不能使用this.wait()，该方法只能与Synchronized配合使用
            }
            number++;
            System.out.println(Thread.currentThread().getName() + " :: " + number);
            condition.signalAll();
        } finally {
            lock.unlock();
        }
    }

    public void decr() throws InterruptedException {
        lock.lock();
        try {
            while (number != 1) {
                condition.await();  
            }
            number--;
            System.out.println(Thread.currentThread().getName() + " :: " + number);
            condition.signalAll();
        } finally {
            lock.unlock();
        }
    }
}
```

```java
package test.lock;

/**
 * @author lzh
 */
public class ThreadDemo {

    public static void main(String[] args) {
        Share share = new Share();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    share.incr();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "AA").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    share.decr();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "BB").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    share.incr();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "CC").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    share.decr();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "DD").start();
    }
}
```

<br>

3.线程定制化通信

案例：AA打印5次，BB打印10次，CC打印15次，以此循环10次

```java
package test.lock;

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * @author lzh
 */
public class ShareResource {

    /**
     * 1-AA 2-BB 3-CC
     */
    private int flag = 1;

    private Lock lock = new ReentrantLock();

    private Condition c1 = lock.newCondition();
    private Condition c2 = lock.newCondition();
    private Condition c3 = lock.newCondition();

    public void print5(int loop) throws InterruptedException {
        lock.lock();
        try {
            while (flag != 1) {
                c1.await();
            }
            for (int i = 0; i < 5; i++) {
                System.out.println(Thread.currentThread().getName() + i + " 轮数: " + loop);
            }
            flag = 2;
            c2.signal();
        } finally {
            lock.unlock();
        }
    }

    public void print10(int loop) throws InterruptedException {
        lock.lock();
        try {
            while (flag != 2) {
                c2.await();
            }
            for (int i = 0; i < 10; i++) {
                System.out.println(Thread.currentThread().getName() + i + " 轮数: " + loop);
            }
            flag = 3;
            c3.signal();
        } finally {
            lock.unlock();
        }
    }

    public void print15(int loop) throws InterruptedException {
        lock.lock();
        try {
            while (flag != 3) {
                c3.await();
            }
            for (int i = 0; i < 15; i++) {
                System.out.println(Thread.currentThread().getName() + i + " 轮数: " + loop);
            }
            flag = 1;
            c1.signal();
        } finally {
            lock.unlock();
        }
    }
}
```

```java
package test.lock;

/**
 * @author lzh
 */
public class ThreadDemo2 {

    public static void main(String[] args) {
        ShareResource shareResource = new ShareResource();
        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    shareResource.print5(i + 1);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "AA").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    shareResource.print10(i + 1);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "BB").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    shareResource.print15(i + 1);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "CC").start();
    }
}
```

<br>

#### 死锁

简介：

​        死锁是多线程编程中一个常见的问题，它发生在两个或多个线程互相等待对方持有的资源而不释放自己所拥有的资源，从而导致所有涉及的线程都无法继续执行的情况。

<br>

代码实现：

```java
package test.sync;

import java.util.concurrent.TimeUnit;

/**
 * @author lzh
 */
public class DeadLock {

    static Object o1 = new Object();
    static Object o2 = new Object();

    public static void main(String[] args) {
        new Thread(() -> {
            synchronized (o1) {
                System.out.println(Thread.currentThread().getName() + "持有锁A，试图获取锁B");
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
                synchronized (o2) {
                    System.out.println(Thread.currentThread().getName() + "获取锁B");
                }
            }
        }, "A").start();

        new Thread(() -> {
            synchronized (o2) {
                System.out.println(Thread.currentThread().getName() + "持有锁B，试图获取锁A");
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
                synchronized (o1) {
                    System.out.println(Thread.currentThread().getName() + "获取锁A");
                }
            }
        }, "B").start();
    }
}
```

<br>

#### FutureTask（未来任务）

简介：

`FutureTask` 是 Java 中 `java.util.concurrent` 包下的一个类，它实现了 `Runnable` 和 `Future` 接口。`FutureTask` 提供了一种封装异步计算任务的方式，使得我们可以将一个可取消的异步操作包装成一个可以执行的任务，并且可以等待该任务完成并获取其结果。

<br>

作用：

1. 异步执行任务
2. 获取任务的结果
3. 取消任务
4. 获取任务状态

<br>

代码示例：

```java
package test.sync;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

/**
 * @author lzh
 */
public class Demo1 {

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        FutureTask<Integer> futureTask = new FutureTask<>(() -> {
            System.out.println(Thread.currentThread().getName() + " come in");
            return 200;
        });

        new Thread(futureTask, "AA").start();

        while (!futureTask.isDone()) {
            System.out.println("wait...");
        }

        System.out.println(futureTask.get());
    }
}
```

<br>

#### JUC辅助类

1.CountDownLatch

简介：

`CountDownLatch` 是 Java 并发库中的一个实用工具类，位于 `java.util.concurrent` 包中。它的主要用途是在一个或多个线程等待其他线程完成一些事件之后再继续执行的情况下提供帮助。`CountDownLatch` 通过计数器来控制线程的等待行为。

<br>

代码示例：

```java
package test.juc;

import java.util.concurrent.CountDownLatch;

/**
 * @author lzh
 */
public class CountDownLatchDemo {

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch countDownLatch = new CountDownLatch(6);

        for (int i = 1; i <= 6; i++) {
            new Thread(() -> {
                System.out.println(Thread.currentThread().getName() + "号同学离开教室");

                countDownLatch.countDown();

            }, String.valueOf(i)).start();
        }

        countDownLatch.await();

        System.out.println(Thread.currentThread().getName() + " 班长锁门走人了");
    }
}
```

<br>

2.CyclicBarrier

简介：

`CyclicBarrier` 是 Java 并发库中的一个实用工具类，位于 `java.util.concurrent` 包中。它的主要用途是让一组线程相互等待，直到到达某个公共屏障点（barrier point）后才继续执行。`CyclicBarrier` 的特点是它可以被重用多次，因此称为“循环”屏障。

<br>

代码示例：

```java
package test.juc;

import java.util.concurrent.CyclicBarrier;

/**
 * @author lzh
 */
public class CyclicBarrierDemo {

    private static final int NUMBER = 7;

    public static void main(String[] args) {
        CyclicBarrier cyclicBarrier = new CyclicBarrier(NUMBER, () -> {
            System.out.println("集齐七颗龙珠就可以召唤神龙");
        });

        for (int i = 1; i <= 7; i++) {
            new Thread(() -> {
                try {
                    System.out.println(Thread.currentThread().getName() + "星龙珠被找到了");
                    cyclicBarrier.await();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }, String.valueOf(i)).start();
        }
    }
}
```

<br>

3.Semaphore

简介：

`Semaphore` 是 Java 并发库中的一个实用工具类，位于 `java.util.concurrent` 包中。它的主要用途是控制对有限数量资源的访问。`Semaphore` 通过维护一个整数计数器来跟踪可用许可的数量，线程可以通过获取许可来访问受保护的资源，释放许可来允许其他线程访问。

<br>

代码示例：

```java
package test.juc;

import java.util.Random;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/**
 * 6辆汽车，停3个车位
 *
 * @author lzh
 */
public class SemaphoreDemo {

    public static void main(String[] args) {
        Semaphore semaphore = new Semaphore(3);

        for (int i = 1; i <= 6; i++) {
            new Thread(() -> {
                try {
                    // 抢占
                    semaphore.acquire();

                    System.out.println(Thread.currentThread().getName() + "抢到了车位");

                    TimeUnit.SECONDS.sleep(new Random().nextInt(5));

                    System.out.println(Thread.currentThread().getName() + "--------离开了车位");
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                } finally {
                    // 释放
                    semaphore.release();
                }
            }, String.valueOf(i)).start();
        }
    }
}
```

<br>

#### 读写锁

简介：

读写锁（Read-Write Lock）是一种特殊的锁机制，它允许多个读取者同时访问共享资源，但只允许一个写入者独占资源。读写锁的设计目的是为了提高并发性能，尤其是在读操作远比写操作频繁的场景中。

<br>

特点：

1. 读读共享：多个线程可以同时持有读锁。
2. 读写互斥：持有读锁的线程不允许获取写锁。
3. 写写互斥：一个线程持有写锁时，其他线程不能获取任何类型的锁。

<br>

代码示例：

```java
package test.readwrite;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * @author lzh
 */
public class MyCache {

    private volatile Map<String, Object> map = new HashMap<>();

    private ReadWriteLock rwLock = new ReentrantReadWriteLock();

    public void put(String key, Object value) {
        // 加写锁
        rwLock.writeLock().lock();
        try {
            System.out.println(Thread.currentThread().getName() + " 正在写操作 " + key);
            TimeUnit.MICROSECONDS.sleep(300);
            map.put(key, value);
            System.out.println(Thread.currentThread().getName() + " 写完了 " + key);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            // 释放写锁
            rwLock.writeLock().unlock();
        }
    }

    public Object get(String key) {
        // 加读锁
        rwLock.readLock().lock();
        try {
            Object result;
            System.out.println(Thread.currentThread().getName() + " 正在读操作 " + key);
            TimeUnit.MICROSECONDS.sleep(300);
            result = map.get(key);
            System.out.println(Thread.currentThread().getName() + " 读完了 " + key);
            return result;
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } finally {
            // 释放读锁
            rwLock.readLock().unlock();
        }
    }
}
```

```java
package test.readwrite;

/**
 * @author lzh
 */
public class ReadWriteLockDemo {

    public static void main(String[] args) {
        MyCache myCache = new MyCache();

        for (int i = 1; i <= 5; i++) {
            final int num = i;
            new Thread(() -> {
                myCache.put(num + "", num + "");
            }, String.valueOf(i)).start();
        }

        for (int i = 1; i <= 5; i++) {
            final int num = i;
            new Thread(() -> {
                myCache.get(num + "");
            }, String.valueOf(i)).start();
        }
    }
}
```

<br>

#### 线程池

自定义线程池

代码示例：

```java
package test.pool;

import java.util.concurrent.*;

/**
 * 自定义线程池创建
 *
 * @author lzh
 */
public class ThreadPoolDemo2 {

    public static void main(String[] args) {
        ExecutorService executorService = new ThreadPoolExecutor(
                2,                      // 核心线程数
                5,                      // 最大线程数
                2L,                     // 线程存活时间
                TimeUnit.SECONDS,       // 时间单位          
                new ArrayBlockingQueue<>(5),                // 阻塞队列
                Executors.defaultThreadFactory(),           // 线程工厂
                new ThreadPoolExecutor.AbortPolicy()        // 拒绝策略
        );

        try {
            for (int i = 1; i <= 10; i++) {
                executorService.execute(() -> {
                    System.out.println(Thread.currentThread().getName() + " 办理业务");
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭线程池
            executorService.shutdown();
        }
    }
}
```

<br>

#### 分支合并框架（Fork/Join）

适用场景：

用于将一个大任务分解成多个小任务，让多个小任务分别去执行，最后将多个小任务的执行结果进行汇总，得到大任务的执行结果

<br>

实现案例：

将`0+1+2+3......+100` 拆分为多个子任务，如`1+2+3+......+50` , `51+52+....+100`两个子任务，然后每个子任务再进行拆分，直到每个子任务的最小值和最大值之差小于10，即最多只能拆分到 `1+2+......+6`。

<br>

代码示例：

```java
package test.forkjoin;

import java.util.concurrent.RecursiveTask;

/**
 * @author lzh
 */
public class MyTask extends RecursiveTask<Integer> {

    /**
     * 拆分差值
     */
    private static final Integer VALUE = 10;
    /**
     * 最小值
     */
    private final int begin;
    /**
     * 最大值
     */
    private final int end;
    /**
     * 计算结果
     */
    private int result;

    public MyTask(int begin, int end) {
        this.begin = begin;
        this.end = end;
    }


    @Override
    protected Integer compute() {
        // 判断差值是否小于等于10，如果是直接相加
        if ((end - begin) <= VALUE) {
            for (int i = begin; i <= end; i++) {
                result += i;
            }
        } else {
            // 进行拆分
            int middle = (begin + end) / 2;
            // 向左拆分
            MyTask task1 = new MyTask(begin, middle);
            // 向右拆分
            MyTask task2 = new MyTask(middle + 1, end);
            // 创建分支
            task1.fork();
            task2.fork();
            // 合并结果
            result = task1.join() + task2.join();
        }
        return result;
    }
}
```

```java
package test.forkjoin;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.ForkJoinPool;

/**
 * @author lzh
 */
public class ForkJoinDemo {

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        // 创建分支合并任务
        MyTask myTask = new MyTask(0, 100);
        // 创建分支合并池
        ForkJoinPool forkJoinPool = new ForkJoinPool();
        forkJoinPool.submit(myTask);
        // 获取结果
        Integer result = myTask.get();
        System.out.println(result);
        // 关闭分支合并池
        forkJoinPool.shutdown();
    }
}
```

<br>

#### CompletableFuture（异步回调）

代码示例：

```java
package test.completable;

import java.util.concurrent.CompletableFuture;

/**
 * @author lzh
 */
public class CompletableFutureDemo {

    public static void main(String[] args) throws Exception {
        // 异步调用，没有返回值
        CompletableFuture<Void> future1 = CompletableFuture.runAsync(() -> {
            System.out.println(Thread.currentThread().getName() + " future1");
        });
        future1.get();

        // 异步调用，有返回值
        CompletableFuture<Integer> future2 = CompletableFuture.supplyAsync(() -> {
            System.out.println(Thread.currentThread().getName() + " future2");
            return 1024;
        });
        future2.whenComplete((t, u) -> {
            System.out.println("----t=" + t);
            System.out.println("----u=" + u);
        }).get();
    }
}
```



