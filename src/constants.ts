import { Weapon, Entity } from './types';

export const WEAPONS: Weapon[] = [
  {
    id: 'w1',
    name: 'Muramasa Plasma',
    description: 'High-frequency edge capable of molecular severance. Features a self-sharpening mono-molecular edge.',
    atk: 2400,
    rarity: 'Legendary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNEJGePNSYv5lSKcA57IutZdXs-CGedUvM5AsgTqsEbTbKJevczMQYIlO4GiGyCJDsJBes3E_XuHmutNZzQYV0xv-lUufHPOJxVEll5tRn3okus31WI4-kLXs43-YqeX1vDhX71EYReWaM6K2atoHmhwcywvSTd21PkqWaV-7jC6Xcc3a_4ATsLuR2iU8mNtPsMvRr-KYFQRAqyZKyuT4Dy8_dL76_cGSkePumDYa0mZElkoWe8GvGOV3Jx4uMonAe5Z9TE39nomnS',
    detailedStats: {
      range: 'Close',
      fireRate: 'N/A',
      weight: '2.4kg'
    }
  },
  {
    id: 'w2',
    name: 'Aeon Railgun',
    description: 'Long-range kinetic accelerator with auto-targeting. Uses electromagnetic pulses to launch projectiles at hypersonic speeds.',
    atk: 3100,
    rarity: 'Epic',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxKmpuMo90doMznJ_Iy1wrr-bKZ26y-32BFInusdGpZaoWMq1mU-QO1HsklNSm5hdGc6tjeP7giF5YhAlZOJ9BXiiZjyNcDUhw0kxEhyAmJjsTU_9xPy8oora4yUlcDEP7rW3Qa9RFa59hCes7zccNTlN96s0aUSzmcSgcvsaG9nBCZE4kRCwiYv-1GNQIGxFwI1BnPSRV3UnZnshkVgbsiD-WdXYhkohG3EjYRTfA0N3a8hmiHrPTvZyAkLnR5RQ9zW27WEAJ8pHQ',
    detailedStats: {
      range: 'Extreme',
      fireRate: 'Low',
      weight: '12.8kg'
    }
  },
  {
    id: 'w3',
    name: 'Vortex Blaster',
    description: 'Creates localized gravity wells that collapse on impact. Ideal for crowd control and heavy armor penetration.',
    atk: 1850,
    rarity: 'Rare',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0jp0yOXhuGhYT4Dl-8_Ygl5AreV_er8GVESNxqRcxvKEt4_Xat05oC3CPx9CsQUSQiShPfFmxeYKgqnpOhHGaCfBUDT6cM_Q2bjO2AeeJL6NOBQfsP3UPjaLMtwu5bMlG7fY9mgZ5wGMcRQOO7X4axqD91JBZoEOeGFxKlK2SW1dqJK8rjTRyP5kVNB3vNpQZRj8a469k7TOEkOo0223P3Wq9Emsx2qZ8qkcjW1wFfx-m0PwP8Qo5o3G1OxBQziD8R-ERH41iBrqH',
    detailedStats: {
      range: 'Medium',
      fireRate: 'Medium',
      weight: '5.2kg'
    }
  }
];

export const ENTITIES: Entity[] = [
  {
    id: 'e1',
    name: "Unit-04 'Orb'",
    description: 'Autonomous defense entity with tactical healing and shield reinforcement capabilities.',
    def: 500,
    type: 'Support',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGV0XRTj5tclke8KczDZOZrQJ8AElYYCYI-xMvGaN2aJOYt_5wBwrEpODKCs-YMyWl3mypjYywWTc7QumvebQgDJbi8k7SzQYCSTvRaYz1yheL8LCqoVCMBTWj3ddsVVcQUEdbTWiuqNu7-lqqBkJ0SbKVKIdWbvc4x7Wu8-9wHBUJyv0Z3IXvE64mRVKDnxKL13kewdmOz2EfUKE3x0TdtyxPogqqmxT_Xo-_rxWhHNSRRsOrMd40RtEiayWNMY_F-bNY4qqUrq6',
    detailedStats: {
      radius: '15m',
      recharge: '30s',
      duration: 'Permanent'
    }
  },
  {
    id: 'e2',
    name: "Sentinel Prime",
    description: 'Heavy vanguard unit designed for front-line absorption. Features reactive plating and kinetic dampeners.',
    def: 1200,
    type: 'Defense',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaCkx1qap81rfJzUJM_vF2zlB7eQJAq-ijv4Fim5qrG8kzIw3hhJ_p9viO-F-K_-5OkCt8Tym6jZJq-PZHXa59nVxSeeCqPk4jJm5Cr10Y18ETZ49I8h0LBTNuRb8HbrbEgk1kwpsjrgENtEFHS3xd-05ExS99ONgNga-EtztZsE-pWJQnPC9eTYP_l7kOpNfWSyfuxMxjLsyHWRW3xLghRGVbRxtxSeQcD981cb27Tnj3g48tp4eSFAwm1Dm9xrRhqTBF-k5aMdpp',
    detailedStats: {
      radius: '5m',
      recharge: '60s',
      duration: '45s'
    }
  }
];
