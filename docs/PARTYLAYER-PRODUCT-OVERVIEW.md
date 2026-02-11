# PartyLayer Wallet SDK — Product Overview

## Ne İnşa Ediyoruz?

PartyLayer, **Canton Network ekosistemi için WalletConnect'tir**. Tıpkı WalletConnect'in Ethereum ekosisteminde herhangi bir dApp'in herhangi bir cüzdanla tek entegrasyonla çalışmasını sağladığı gibi, PartyLayer da Canton Network'te aynı deneyimi sunar.

Tek bir SDK entegrasyonu ile dApp geliştiricileri, ekosistemde mevcut ve gelecekte eklenecek tüm Canton cüzdanlarına otomatik olarak bağlanır — cüzdan bazında ayrı entegrasyon yazmaya gerek kalmaz.

---

## Kime Hitap Ediyoruz?

### 1. dApp Geliştiricileri (Birincil Hedef)

Canton Network üzerinde uygulama geliştiren yazılım ekipleri. Bu ekipler:

- DeFi protokolleri, tokenizasyon platformları, ödeme uygulamaları geliştiriyor
- Birden fazla cüzdanı desteklemek istiyor ama her biri için ayrı entegrasyon yazmak istemiyor
- Kurumsal müşterileri var ve güvenlik/uyumluluk önemli

**PartyLayer bu ekiplere ne sağlıyor:**
- 5 dakikada tam cüzdan entegrasyonu (3 adım: install, wrap, connect)
- 4+ cüzdan desteği tek entegrasyonla (Console, Loop, Cantor8, Bron)
- React hooks ile hazır UI bileşenleri
- TypeScript-first: tam tip güvenliği
- Yeni cüzdanlar eklendiğinde kod değişikliği gerektirmez (registry otomatik güncellenir)

### 2. Cüzdan Geliştiricileri (İkincil Hedef)

Canton ekosistemi için cüzdan geliştiren ekipler. Bu ekipler:

- Yeni bir Canton cüzdanı piyasaya sürüyor
- Ekosistemde mevcut dApp'lere hızlı entegrasyon istiyor
- CIP-0103 standardına uyum sağlamak istiyor

**PartyLayer bu ekiplere ne sağlıyor:**
- Adapter interface'i ile standart entegrasyon noktası
- Conformance test suite ile CIP-0103 uyumluluk doğrulaması
- Registry'ye eklendiklerinde tüm PartyLayer kullanan dApp'lerde otomatik görünüm

### 3. Canton Network Ekosistemi (Ekosistem Değeri)

- Parçalanmayı önler — her dApp kendi cüzdan listesini tutmak zorunda kalmaz
- Standardizasyon sağlar — CIP-0103 üzerinden ortak dil oluşturur
- Yeni cüzdanlar ve dApp'ler arasında ağ etkisi yaratır

---

## Ne Yapabiliyoruz? (Özellikler)

### Cüzdan Keşfi ve Bağlantı

| Özellik | Açıklama |
|---------|----------|
| **Otomatik Cüzdan Keşfi** | Tarayıcıda yüklü cüzdanları otomatik tespit eder (`window.canton.*`) |
| **Registry-Backed Keşif** | Merkezi registry'den doğrulanmış cüzdan listesi çeker |
| **Kriptografik Doğrulama** | Registry Ed25519 ile imzalıdır — tahrif edilemez |
| **Akıllı Önbellekleme** | SWR pattern: önce cache, arka planda güncelle, offline çalış |
| **Çoklu Bağlantı Yöntemi** | Browser extension, QR kod, deep link, OAuth2 desteği |
| **Session Yönetimi** | Şifrelenmiş session storage, otomatik restore, expiry kontrolü |
| **Origin Binding** | Session'lar origin'e bağlı — cross-site erişim engellenir |

### İmzalama ve İşlem

| Özellik | Açıklama |
|---------|----------|
| **Mesaj İmzalama** | Rastgele mesaj imzalama (kimlik doğrulama, uygulama-spesifik) |
| **İşlem İmzalama** | DAML komutlarını cüzdan üzerinden imzalama |
| **İşlem Gönderimi** | İmzalanmış işlemi ledger'a gönderme |
| **Ledger API Proxy** | JSON Ledger API'ye cüzdan üzerinden kimlik doğrulamalı erişim |
| **İşlem Yaşam Döngüsü** | pending → signed → executed/failed event akışı |
| **Async Cüzdan Desteği** | Mobil cüzdan redirect/QR kod akışları (5 dk timeout) |

### Geliştirici Deneyimi

| Özellik | Açıklama |
|---------|----------|
| **React Hooks** | useConnect, useSession, useWallets, useSignMessage, useSignTransaction |
| **Zero Config** | Sensible defaults ile sıfır konfigürasyon başlangıç |
| **Tam TypeScript** | Tüm API'ler tip-güvenli |
| **Modüler Mimari** | Sadece ihtiyacın olanı yükle (@partylayer/sdk, @partylayer/react) |
| **Hata Modeli** | Zengin hata tipleri, numeric error codes (EIP-1193/EIP-1474) |
| **Telemetri** | Opt-in metrics: bağlantı, imzalama, hata metrikleri |

---

## Desteklenen Cüzdanlar

| Cüzdan | Transport | Kullanım Senaryosu | Otomatik? |
|--------|-----------|---------------------|-----------|
| **Console Wallet** | Browser Extension (PostMessage) | Masaüstü kullanıcılar, extension yüklü | Evet |
| **5N Loop** | QR Kod / Web Popup | Mobil veya web cüzdan kullanıcıları | Evet |
| **Cantor8 (C8)** | Browser Extension (Deep Link) | Masaüstü kullanıcılar, extension yüklü | Evet |
| **Bron** | Remote Signer (OAuth2 + API) | Kurumsal/saklama çözümü | Manuel konfigürasyon |

Yeni bir cüzdan geliştirildiğinde:
1. Adapter interface'ini implemente eder
2. Registry'ye eklenir
3. Tüm PartyLayer kullanan dApp'lerde **otomatik olarak** görünür

---

## CIP-0103 Uyumluluğu

### CIP-0103 Nedir?

**CIP-0103 (Canton Improvement Proposal 0103)**, Canton Network için standart dApp API spesifikasyonudur. Ethereum'daki EIP-1193'ün (Provider API) Canton versiyonudur. dApp'lerin cüzdanlarla nasıl iletişim kurduğunu standartlaştırır.

### Neden Önemli?

- **Interoperability**: Herhangi bir CIP-0103 uyumlu cüzdan, herhangi bir CIP-0103 uyumlu dApp ile çalışır
- **Güvenlik**: Standartlaştırılmış hata kodları ve yetkilendirme kontrolleri
- **Geleceğe Hazırlık**: Yeni özellikler geriye uyumlu şekilde eklenebilir
- **Ekosistem Güveni**: Canton Foundation tarafından yönetilen resmi standart

### Tam Uyumluluk Tablosu

#### 10 Zorunlu Method

| # | Method | Ne Yapar | Durumumuz |
|---|--------|----------|-----------|
| 1 | `connect` | Cüzdana bağlantı başlatır, login akışını tetikler | **Tam uyumlu** — Sync + async (userUrl) desteği |
| 2 | `disconnect` | Session'ı kapatır, token'ları invalidate eder | **Tam uyumlu** |
| 3 | `isConnected` | Login tetiklemeden bağlantı durumunu kontrol eder | **Tam uyumlu** — Cüzdan olmadan bile çalışır |
| 4 | `status` | Provider, bağlantı, ağ, session bilgilerini döner | **Tam uyumlu** — CAIP-2 ağ ID, provider bilgisi |
| 5 | `getActiveNetwork` | Aktif ağ bilgisini döner | **Tam uyumlu** — CAIP-2 format (canton:da-devnet) |
| 6 | `listAccounts` | Tüm erişilebilir hesapları listeler | **Tam uyumlu** — Account shape spec'e uygun |
| 7 | `getPrimaryAccount` | Seçili birincil hesabı döner | **Tam uyumlu** — Session yoksa DISCONNECTED hatası |
| 8 | `signMessage` | Rastgele mesaj imzalar | **Tam uyumlu** — Signature string döner |
| 9 | `prepareExecute` | İşlem yaşam döngüsünü başlatır | **Tam uyumlu** — pending → signed → executed/failed |
| 10 | `ledgerApi` | JSON Ledger API'ye proxy erişim | **Tam uyumlu** — Adapter destekliyorsa proxy, yoksa UNSUPPORTED_METHOD |

#### 4 Zorunlu Event

| Event | Ne Zaman Tetiklenir | Durumumuz |
|-------|---------------------|-----------|
| `statusChanged` | Bağlantı/kimlik durumu değiştiğinde | **Tam uyumlu** — Connect, disconnect, ağ değişikliği |
| `accountsChanged` | Hesap listesi değiştiğinde | **Tam uyumlu** — Hesap ekleme/çıkarma/seçim değişikliği |
| `txChanged` | İşlem yaşam döngüsü ilerlemesinde | **Tam uyumlu** — pending, signed, executed, failed payloads |
| `connected` | Async bağlantı tamamlandığında | **Tam uyumlu** — Session bağlantısında emit edilir |

#### Provider Interface

| Gereksinim | Durumumuz |
|------------|-----------|
| `request<T>(args): Promise<T>` | **Uyumlu** |
| `on(event, listener): Provider` (chaining) | **Uyumlu** |
| `emit(event, ...args): boolean` | **Uyumlu** |
| `removeListener(event, listener): Provider` (chaining) | **Uyumlu** |

#### Hata Modeli

| Gereksinim | Durumumuz |
|------------|-----------|
| `ProviderRpcError` with numeric `code` | **Uyumlu** |
| EIP-1193 kodları (4001, 4100, 4200, 4900, 4901) | **Tüm kodlar tanımlı** |
| EIP-1474 kodları (-32700 ile -32005 arası) | **Tüm 11 kod tanımlı** |
| Custom kodların sızmaması | **Doğrulandı** — Tüm hatalar normalize edilir |

#### İşlem Yaşam Döngüsü (txChanged Event Payloads)

| Durum | Payload | Durumumuz |
|-------|---------|-----------|
| `pending` | `{ status, commandId }` | **Uyumlu** |
| `signed` | `{ status, commandId, payload: { signature, signedBy, party } }` | **Uyumlu** |
| `executed` | `{ status, commandId, payload: { updateId, completionOffset } }` | **Uyumlu** |
| `failed` | `{ status, commandId }` | **Uyumlu** |

---

## Gerçek Dünya Senaryosu: TokenSwap dApp

Aşağıda bir DeFi token swap uygulamasının PartyLayer ile nasıl çalıştığını adım adım anlatalım.

### Senaryo

**TokenSwap**, Canton Network üzerinde çalışan bir DeFi uygulamasıdır. Kullanıcılar token takası yapabilir. TokenSwap geliştiricisi, 4 farklı Canton cüzdanını desteklemek istiyor.

### Adım 1: dApp Geliştiricisi Entegrasyonu (Tek Seferlik, 5 Dakika)

```typescript
// 1. Paketleri yükle
// npm install @partylayer/sdk @partylayer/react

// 2. Client oluştur
import { createPartyLayer } from '@partylayer/sdk';

const client = createPartyLayer({
  network: 'mainnet',
  app: { name: 'TokenSwap' },
  // Hepsi bu kadar. Registry URL, cüzdan listesi, cache — hepsi otomatik.
});

// 3. React uygulamasını sar
import { PartyLayerProvider } from '@partylayer/react';

function App() {
  return (
    <PartyLayerProvider client={client}>
      <TokenSwapApp />
    </PartyLayerProvider>
  );
}
```

**Geliştirici 4 cüzdan için tek satır kod yazmadı.** Registry otomatik olarak Console, Loop, Cantor8 ve Bron cüzdanlarını keşfeder.

### Adım 2: Kullanıcı TokenSwap'ı Ziyaret Eder

```
Kullanıcı → tokenswap.canton.app açar
         ↓
PartyLayerProvider mount olur
         ↓
Registry'den cüzdan listesi çekilir (cache varsa anında, yoksa ağdan)
         ↓
Ed25519 imza doğrulanır (registry tahrif edilmemiş)
         ↓
Tarayıcıda yüklü cüzdanlar tespit edilir (window.canton.*)
         ↓
Kullanıcı "Connect Wallet" butonunu görür
```

### Adım 3: Kullanıcı Cüzdan Seçer

**Senaryo A — Masaüstü Kullanıcı (Console Wallet Extension)**

```
Kullanıcı → "Connect Wallet" butonuna tıklar
         ↓
Modal açılır: 4 cüzdan listelenir
  ✅ Console Wallet [Installed]
  ○  5N Loop
  ○  Cantor8
  ○  Bron
         ↓
Kullanıcı "Console Wallet" seçer
         ↓
provider.request({ method: 'connect' })
         ↓
Console extension popup açılır: "TokenSwap bağlanmak istiyor"
         ↓
Kullanıcı "Onayla" der
         ↓
Extension → { isConnected: true } döner
         ↓
statusChanged event → dApp UI güncellenir
         ↓
UI: "Bağlandı: party::alice::1234..."
```

**CIP-0103 akışı:**
1. `connect` → `{ isConnected: true }`
2. `statusChanged` event emit → `{ connection: { isConnected: true }, provider: {...}, network: { networkId: "canton:da-mainnet" } }`
3. `accountsChanged` event emit → `[{ primary: true, partyId: "party::alice::1234", status: "allocated", ... }]`
4. `connected` event emit → `{ isConnected: true }`

**Senaryo B — Mobil Kullanıcı (5N Loop)**

```
Kullanıcı → "Connect Wallet" butonuna tıklar
         ↓
Modal açılır: "5N Loop" seçer
         ↓
provider.request({ method: 'connect' })
         ↓
Loop provider → { isConnected: false, userUrl: "https://loop.5n.app/connect?session=xyz" }
         ↓
handleAsyncConnect() başlar
         ↓
QR Kod gösterilir (userUrl encode edilmiş)
         ↓
Kullanıcı telefonuyla QR kodu tarar
         ↓
Loop uygulaması açılır: "TokenSwap bağlanmak istiyor"
         ↓
Kullanıcı telefonunda "Onayla" der
         ↓
Loop provider 'connected' event emit eder
         ↓
handleAsyncConnect() resolve olur → { isConnected: true }
         ↓
statusChanged event → dApp UI güncellenir
         ↓
UI: "Bağlandı: party::bob::5678..."
```

**CIP-0103 akışı (async):**
1. `connect` → `{ isConnected: false, userUrl: "https://..." }` (async wallet)
2. `onUserUrl` callback → UI QR kod gösterir
3. Kullanıcı mobilde onaylar → wallet provider `connected` event emit eder
4. Provider `statusChanged` + `accountsChanged` + `connected` emit eder
5. Promise resolve olur → `{ isConnected: true }`

### Adım 4: Kullanıcı Token Swap Yapar

```
Kullanıcı → "100 DAR → 50 USDC Swap" butonuna tıklar
         ↓
dApp prepareExecute çağırır:
  provider.request({
    method: 'prepareExecute',
    params: {
      tx: {
        commands: [{
          exerciseCommand: {
            templateId: "TokenSwap:Swap",
            contractId: "#1:0",
            choice: "Execute",
            argument: { amount: 100, targetToken: "USDC" }
          }
        }]
      }
    }
  })
         ↓
--- EVENT 1: txChanged { status: 'pending', commandId: 'cmd_1707...' } ---
UI: "İşlem hazırlanıyor..."
         ↓
Cüzdan imzalama ekranı açılır:
  "TokenSwap 100 DAR → 50 USDC swap işlemini onaylıyor musunuz?"
         ↓
Kullanıcı "Onayla" der
         ↓
--- EVENT 2: txChanged { status: 'signed', commandId: 'cmd_1707...', payload: { signature: '0xabc...', signedBy: 'party::alice::1234', party: 'party::alice::1234' } } ---
UI: "İmzalandı, ledger'a gönderiliyor..."
         ↓
Cüzdan işlemi Canton ledger'a gönderir
         ↓
Ledger işlemi doğrular ve commit eder
         ↓
--- EVENT 3: txChanged { status: 'executed', commandId: 'cmd_1707...', payload: { updateId: 'update-789', completionOffset: 42 } } ---
UI: "Swap başarılı! 100 DAR → 50 USDC"
```

**Hata senaryosu:**
```
Kullanıcı "Reddet" derse:
         ↓
--- EVENT: txChanged { status: 'failed', commandId: 'cmd_1707...' } ---
ProviderRpcError { code: 4001, message: "User rejected request" }
         ↓
UI: "İşlem reddedildi"
```

### Adım 5: dApp Ledger API Kullanır

```
dApp kullanıcının bakiyesini sorgulamak ister:
         ↓
provider.request({
  method: 'ledgerApi',
  params: {
    requestMethod: 'GET',
    resource: '/v1/state/acs'
  }
})
         ↓
Cüzdan adapter'ı, kullanıcının party ID'si ile
kimlik doğrulamalı Ledger API isteği yapar
         ↓
{ response: '{"activeContracts": [...]}' }
         ↓
dApp bakiyeleri parse edip UI'da gösterir
```

### Adım 6: Kullanıcı Oturumu Kapatır

```
Kullanıcı → "Disconnect" butonuna tıklar
         ↓
provider.request({ method: 'disconnect' })
         ↓
Session invalidate edilir
Encrypted storage temizlenir
         ↓
--- EVENT: statusChanged { connection: { isConnected: false } } ---
         ↓
UI: "Cüzdan bağlantısı kesildi"
```

---

## Mimari Özet

```
┌─────────────────────────────────────────────────────┐
│                     dApp (React)                      │
│                                                       │
│  useConnect()  useSession()  useSignMessage()          │
│  useWallets()  useDisconnect()  useSignTransaction()   │
│                                                       │
├─────────────────────────────────────────────────────┤
│               @partylayer/react                       │
│          PartyLayerProvider (Context)                  │
├─────────────────────────────────────────────────────┤
│                @partylayer/sdk                        │
│          PartyLayerClient (Session, Events)            │
│    ┌──────────────┐  ┌──────────────────────┐        │
│    │ Registry      │  │ Adapter Manager      │        │
│    │ (Verified)    │  │ (Console,Loop,C8,Bron)│        │
│    └──────────────┘  └──────────────────────┘        │
├─────────────────────────────────────────────────────┤
│              @partylayer/provider                     │
│                                                       │
│   ┌─────────────────┐    ┌──────────────────┐        │
│   │ PartyLayerProvider│    │ Bridge           │        │
│   │ (Native CIP-0103)│    │ (Legacy SDK →    │        │
│   │                   │    │  CIP-0103)       │        │
│   └────────┬──────────┘    └────────┬─────────┘        │
│            │                        │                  │
│   ┌────────▼──────────┐    ┌────────▼─────────┐        │
│   │ Wallet Discovery  │    │ Event Wiring     │        │
│   │ (window.canton.*) │    │ (SDK → CIP-0103) │        │
│   └───────────────────┘    └──────────────────┘        │
├─────────────────────────────────────────────────────┤
│                @partylayer/core                       │
│   CIP-0103 Types │ Error Model │ Adapter Interface    │
└─────────────────────────────────────────────────────┘
         │              │              │           │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐ ┌───▼───┐
    │ Console │   │  Loop   │   │ Cantor8 │ │ Bron  │
    │ Wallet  │   │  (5N)   │   │  (C8)   │ │(OAuth)│
    └─────────┘   └─────────┘   └─────────┘ └───────┘
```

---

## Değer Önerisi Özeti

| Stakeholder | PartyLayer Olmadan | PartyLayer İle |
|-------------|-------------------|----------------|
| **dApp Geliştirici** | Her cüzdan için ayrı entegrasyon (4 cüzdan = 4x iş) | Tek entegrasyon, tüm cüzdanlar otomatik |
| **Cüzdan Geliştirici** | Her dApp ile ayrı entegrasyon anlaşması | Adapter yaz, registry'ye eklen, tüm dApp'lerde çalış |
| **Son Kullanıcı** | "Bu dApp benim cüzdanımı desteklemiyor" | Tüm Canton cüzdanları her dApp'te çalışır |
| **Canton Ekosistemi** | Parçalanmış, her dApp farklı cüzdanları destekliyor | Birleşik, standartlaştırılmış, ağ etkisi |

---

## Teknik Güvenlik Özellikleri

- **Registry İmza Doğrulaması**: Ed25519 ile imzalanmış cüzdan listesi
- **Sequence Koruması**: Registry rollback saldırılarını engeller
- **Origin Binding**: Session'lar domain'e bağlı (cross-site erişim yok)
- **Şifreli Storage**: Session verileri WebCrypto ile şifrelenmiş
- **Capability Guard**: Her işlem öncesi cüzdan yetkisi kontrol edilir
- **Timeout Protection**: Bağlantı ve işlem timeout'ları (2dk connect, 5dk async)
- **Error Normalization**: Tüm hatalar standart kodlarla — bilgi sızıntısı yok

---

## Test ve Uyumluluk

- **198 unit test** — tüm paketlerde, tümü geçiyor
- **35 E2E compliance test** — CIP-0103 spesifikasyonuna karşı tam doğrulama
- **Conformance Runner CLI** — herhangi bir CIP-0103 Provider'ı test edebilen bağımsız araç
- **İşlem yaşam döngüsü testleri** — pending, signed, executed, failed akışları doğrulanmış
- **Event payload doğrulama** — tüm discriminated union varyantları test edilmiş
