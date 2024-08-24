import {defineUserConfig} from 'vuepress'
import {viteBundler} from '@vuepress/bundler-vite'
import {plumeTheme} from 'vuepress-theme-plume'

export default defineUserConfig({
    base: '/',
    lang: 'zh-CN',
    theme: plumeTheme({
        avatar: {
            url: 'https://img.picui.cn/free/2024/07/15/6694c8fb043d8.jpg',
            name: '路白榆',
            description: '一名普普通通的编程爱好者',
            circle: true,
            location: 'GuangZhou China'
        },
        navbar: [
            {text: '首页', link: '/', icon: 'material-symbols:home-outline'},
            {text: '博客', link: '/blog/', icon: 'material-symbols:article-outline'},
            {
                text: '笔记',
                icon: 'material-symbols:event-note-outline',
                items: [
                    {
                        text: 'Java',
                        link: '/java/',
                    },
                    {
                        text: 'Spring',
                        link: '/spring/',
                    },
                    {
                        text: 'Spring Cloud',
                        link: '/cloud/',
                    },
                    {
                        text: '中间件',
                        link: '/center/',
                    }
                ]
            },
        ],
        notes: {
            dir: '/notes/',
            link: '/',
            notes: [
                {
                    dir: 'java',
                    link: '/java/',
                    sidebar: [
                        {
                            items: ['juc']
                        }
                    ]
                },
                {
                    dir: 'spring',
                    link: '/spring/',
                    sidebar: [
                        {
                            items: ['aop']
                        }
                    ]
                },
                {
                    dir: 'springcloud',
                    link: '/cloud/',
                    sidebar: [
                        {
                            items: ['rc', 're', 'rb', 'gw', 'dubbo']
                        }
                    ]
                },
                {
                    dir: 'middleware',
                    link: '/center/',
                    sidebar: [
                        {
                            items: ['docker', 'rabbitmq', 'redis', 'nginx']
                        }
                    ]
                }
            ],
        }
    }),
    bundler: viteBundler(),
})