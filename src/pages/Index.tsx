import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SERVERS = [
  { id: "dm", icon: "💬", name: "Личные сообщения", color: "#6378eb" },
  { id: "s1", icon: "🚀", name: "Команда Ракета", color: "#eb6363" },
  { id: "s2", icon: "🎮", name: "Геймеры", color: "#63eb9a" },
  { id: "s3", icon: "🎨", name: "Дизайн", color: "#ebb563" },
  { id: "s4", icon: "🤖", name: "AI Лаборатория", color: "#b563eb" },
];

const DM_CHATS = [
  { id: "c1", name: "Алексей Орлов", avatar: "АО", status: "online", lastMsg: "Когда встреча?", time: "14:23", unread: 2 },
  { id: "c2", name: "Мария Соколова", avatar: "МС", status: "online", lastMsg: "Отправила файлы 📎", time: "13:10", unread: 0 },
  { id: "c3", name: "Дмитрий Волков", avatar: "ДВ", status: "idle", lastMsg: "ок, понял", time: "11:55", unread: 0 },
  { id: "c4", name: "Анна Петрова", avatar: "АП", status: "dnd", lastMsg: "Завтра в 10:00", time: "вчера", unread: 5 },
  { id: "c5", name: "Команда Ракета", avatar: "КР", status: "offline", lastMsg: "Игорь: Запустили!", time: "пн", unread: 0 },
];

const SERVER_CHANNELS: Record<string, { categories: Array<{ name: string; channels: Array<{ id: string; type: string; name: string; unread: number }> }> }> = {
  s1: {
    categories: [
      { name: "ИНФОРМАЦИЯ", channels: [
        { id: "ch1", type: "text", name: "объявления", unread: 0 },
        { id: "ch2", type: "text", name: "правила", unread: 0 },
      ]},
      { name: "ОБЩЕНИЕ", channels: [
        { id: "ch3", type: "text", name: "общий", unread: 3 },
        { id: "ch4", type: "text", name: "разработка", unread: 0 },
        { id: "ch5", type: "voice", name: "Голосовой 1", unread: 0 },
        { id: "ch6", type: "voice", name: "Голосовой 2", unread: 0 },
      ]},
      { name: "ПРОЕКТЫ", channels: [
        { id: "ch7", type: "text", name: "бэклог", unread: 1 },
        { id: "ch8", type: "text", name: "релизы", unread: 0 },
      ]},
    ]
  },
  s2: { categories: [{ name: "КАНАЛЫ", channels: [
    { id: "g1", type: "text", name: "общий", unread: 7 },
    { id: "g2", type: "text", name: "minecraft", unread: 0 },
    { id: "g3", type: "voice", name: "Играем вместе", unread: 0 },
  ]}]},
  s3: { categories: [{ name: "КАНАЛЫ", channels: [
    { id: "d1", type: "text", name: "inspiration", unread: 0 },
    { id: "d2", type: "text", name: "фидбек", unread: 2 },
  ]}]},
  s4: { categories: [{ name: "КАНАЛЫ", channels: [
    { id: "a1", type: "text", name: "gpt-4", unread: 0 },
    { id: "a2", type: "text", name: "промпты", unread: 4 },
    { id: "a3", type: "voice", name: "AI-стендап", unread: 0 },
  ]}]},
};

type Message = { id: string; author: string; avatar: string; text: string; time: string; reactions?: Array<{ emoji: string; count: number }>; isMe?: boolean };

const MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: "m1", author: "Алексей Орлов", avatar: "АО", text: "Привет! Как дела с проектом?", time: "14:01" },
    { id: "m2", author: "Я", avatar: "Я", text: "Всё хорошо, почти закончили первый спринт 🚀", time: "14:05", isMe: true },
    { id: "m3", author: "Алексей Орлов", avatar: "АО", text: "Отлично! Когда встреча по результатам?", time: "14:23", reactions: [{ emoji: "👍", count: 1 }] },
  ],
  c2: [
    { id: "m1", author: "Мария Соколова", avatar: "МС", text: "Добрый день! Отправила файлы 📎", time: "13:10" },
    { id: "m2", author: "Я", avatar: "Я", text: "Получил, спасибо!", time: "13:12", isMe: true },
  ],
  ch3: [
    { id: "m1", author: "Игорь Синий", avatar: "ИС", text: "Всем привет! Новый релиз уже в проде 🎉", time: "10:00", reactions: [{ emoji: "🎉", count: 5 }, { emoji: "🚀", count: 3 }] },
    { id: "m2", author: "Дарья", avatar: "ДА", text: "Огонь! Давно ждала этой фичи", time: "10:03" },
    { id: "m3", author: "Я", avatar: "Я", text: "Тоже рад! Теперь тестируем.", time: "10:05", isMe: true },
    { id: "m4", author: "Игорь Синий", avatar: "ИС", text: "Да, баг-репорты кидайте в #бэклог", time: "10:07" },
  ],
  g1: [
    { id: "m1", author: "Артём", avatar: "АТ", text: "Кто сегодня вечером играет?", time: "18:00" },
    { id: "m2", author: "Влад", avatar: "ВЛ", text: "Я в! Во сколько стартуем?", time: "18:02" },
    { id: "m3", author: "Я", avatar: "Я", text: "В 21:00 норм?", time: "18:05", isMe: true, reactions: [{ emoji: "✅", count: 4 }] },
  ],
};

const ONLINE_MEMBERS = [
  { name: "Алексей Орлов", avatar: "АО", status: "online", role: "Администратор" },
  { name: "Мария Соколова", avatar: "МС", status: "online", role: "Модератор" },
  { name: "Я", avatar: "Я", status: "online", role: "Участник" },
  { name: "Дарья", avatar: "ДА", status: "online", role: "Участник" },
  { name: "Максим К.", avatar: "МК", status: "idle", role: "Участник" },
  { name: "Дмитрий Волков", avatar: "ДВ", status: "offline", role: "Участник" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor = (s: string) => ({ online: "bg-green-400", idle: "bg-yellow-400", dnd: "bg-red-400", offline: "bg-gray-500" }[s] ?? "bg-gray-500");
const statusLabel = (s: string) => ({ online: "В сети", idle: "Отошёл", dnd: "Не беспокоить", offline: "Не в сети" }[s] ?? s);

function AvatarBubble({ label, size = 36, color }: { label: string; size?: number; color?: string }) {
  const palette = ["#6378eb", "#eb6363", "#63eb9a", "#ebb563", "#b563eb", "#63b5eb"];
  const bg = color ?? palette[label.charCodeAt(0) % palette.length];
  return (
    <div className="flex items-center justify-center rounded-full font-semibold text-white flex-shrink-0 select-none"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}>
      {label}
    </div>
  );
}

// ─── Video Call Modal ─────────────────────────────────────────────────────────

function VideoCallModal({ participant, onClose }: { participant: string; onClose: () => void }) {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="animate-scale-in relative rounded-2xl overflow-hidden flex flex-col"
        style={{ width: "min(680px, 95vw)", height: "min(460px, 90vh)", background: "hsl(220 15% 6%)", border: "1px solid hsl(var(--border))" }}>
        {/* Main video area */}
        <div className="flex-1 relative flex items-center justify-center" style={{ background: "hsl(220 13% 10%)" }}>
          {videoOff ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <AvatarBubble label={participant.slice(0, 2).toUpperCase()} size={80} />
              <span className="text-sm">Камера выключена</span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a1f3a 0%, #0d1117 100%)" }}>
              <div className="text-muted-foreground/20 text-7xl">📹</div>
            </div>
          )}

          {/* Timer */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full font-mono text-sm"
            style={{ background: "rgba(0,0,0,0.55)", color: "hsl(var(--accent-blue))" }}>
            {fmt(time)}
          </div>

          {/* PiP */}
          <div className="absolute bottom-4 right-4 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ width: 130, height: 85, background: "hsl(220 13% 14%)", border: "2px solid hsl(var(--border))" }}>
            {videoOff ? <AvatarBubble label="Я" size={36} /> : <div className="text-muted-foreground/30 text-2xl">👤</div>}
            <div className="absolute bottom-1 left-2 text-xs text-white/50">Вы</div>
          </div>

          {/* Participant */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-white/80">{participant}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 py-4" style={{ background: "hsl(220 15% 8%)" }}>
          <button onClick={() => setMuted(m => !m)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: muted ? "hsl(var(--destructive))" : "hsl(var(--border))" }}>
            <Icon name={muted ? "MicOff" : "Mic"} size={20} />
          </button>
          <button onClick={() => setVideoOff(v => !v)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: videoOff ? "hsl(var(--destructive))" : "hsl(var(--border))" }}>
            <Icon name={videoOff ? "VideoOff" : "Video"} size={20} />
          </button>
          <button className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: "hsl(var(--border))" }}>
            <Icon name="Monitor" size={20} />
          </button>
          <button onClick={onClose}
            className="w-14 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: "hsl(var(--destructive))" }}>
            <Icon name="PhoneOff" size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Search Modal ─────────────────────────────────────────────────────────────

function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const items = [
    ...DM_CHATS.map(c => ({ id: c.id, name: c.name, sub: "Личный чат", avatar: c.avatar })),
    ...SERVERS.slice(1).map(s => ({ id: s.id, name: s.name, sub: "Сервер", avatar: s.icon })),
  ];
  const filtered = q ? items.filter(i => i.name.toLowerCase().includes(q.toLowerCase())) : items;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="animate-scale-in w-full max-w-lg rounded-xl overflow-hidden"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <Icon name="Search" size={17} className="text-muted-foreground flex-shrink-0" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Поиск по чатам, серверам..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
          <kbd className="text-xs px-2 py-0.5 rounded text-muted-foreground" style={{ background: "hsl(var(--border))" }}>ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.map(item => (
            <div key={item.id} onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 flex items-center justify-center rounded-full text-base flex-shrink-0"
                style={{ background: "hsl(var(--muted))" }}>
                {item.avatar.length <= 3 && /[А-ЯA-Z]/.test(item.avatar)
                  ? <AvatarBubble label={item.avatar} size={32} />
                  : <span>{item.avatar}</span>}
              </div>
              <div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const [activeServer, setActiveServer] = useState("dm");
  const [activeChat, setActiveChat] = useState("c1");
  const [activeChatName, setActiveChatName] = useState("Алексей Орлов");
  const [messages, setMessages] = useState(MESSAGES);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"chats" | "servers" | "notifications" | "profile" | "settings">("chats");
  const [showVideo, setShowVideo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeChat, messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      author: "Я", avatar: "Я",
      text: input,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };
    setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] ?? []), msg] }));
    setInput("");
  };

  const selectChat = (id: string, name: string) => {
    setActiveChat(id);
    setActiveChatName(name);
    setMobileSidebar(false);
  };

  const isDM = activeServer === "dm";
  const currentMessages = messages[activeChat] ?? [];
  const serverData = SERVER_CHANNELS[activeServer];

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {showVideo && <VideoCallModal participant={activeChatName} onClose={() => setShowVideo(false)} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      {/* ══ Server Rail ══════════════════════════════════════ */}
      <div className="hidden md:flex flex-col items-center gap-2 py-3 px-2 flex-shrink-0"
        style={{ width: 68, background: "hsl(var(--srv-bg))", borderRight: "1px solid hsl(var(--border))" }}>

        <button onClick={() => { setActiveServer("dm"); }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-200 ${activeServer === "dm" ? "rounded-xl" : "hover:rounded-xl"}`}
          style={{ background: activeServer === "dm" ? "hsl(var(--accent-blue))" : "hsl(var(--chan-bg))" }}
          title="Личные сообщения">
          💬
        </button>

        <div className="w-8 h-px" style={{ background: "hsl(var(--border))" }} />

        {SERVERS.slice(1).map(srv => (
          <button key={srv.id} onClick={() => { setActiveServer(srv.id); }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-200 ${activeServer === srv.id ? "rounded-xl scale-105" : "hover:rounded-xl"}`}
            style={{ background: activeServer === srv.id ? srv.color : "hsl(var(--chan-bg))" }}
            title={srv.name}>
            {srv.icon}
          </button>
        ))}

        <button className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:rounded-xl"
          style={{ background: "hsl(var(--chan-bg))" }} title="Добавить сервер">
          <Icon name="Plus" size={22} style={{ color: "hsl(var(--accent-green))" }} />
        </button>

        <div className="mt-auto">
          <button onClick={() => setShowSearch(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors" title="Поиск">
            <Icon name="Search" size={17} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ══ Channel / DM List ════════════════════════════════ */}
      <div className={`flex-col flex-shrink-0 ${mobileSidebar ? "flex absolute inset-y-0 left-0 z-40" : "hidden md:flex"}`}
        style={{ width: 240, background: "hsl(var(--chan-bg))", borderRight: "1px solid hsl(var(--border))" }}>

        <div className="px-4 py-3 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <span className="font-semibold text-sm truncate">
            {isDM ? "Личные сообщения" : SERVERS.find(s => s.id === activeServer)?.name}
          </span>
          {isDM && (
            <button onClick={() => setShowSearch(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
              <Icon name="Search" size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {isDM
            ? DM_CHATS.map(chat => (
              <button key={chat.id} onClick={() => selectChat(chat.id, chat.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mx-1 transition-all text-left ${activeChat === chat.id ? "bg-white/10" : "hover:bg-white/5"}`}
                style={{ width: "calc(100% - 8px)" }}>
                <div className="relative flex-shrink-0">
                  <AvatarBubble label={chat.avatar} size={34} />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${statusColor(chat.status)}`}
                    style={{ borderColor: "hsl(var(--chan-bg))" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{chat.name}</span>
                    <span className="text-xs text-muted-foreground ml-1 flex-shrink-0">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">{chat.lastMsg}</span>
                    {chat.unread > 0 && (
                      <span className="ml-1 text-xs text-white font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0"
                        style={{ background: "hsl(var(--accent-blue))", fontSize: 10 }}>
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
            : serverData?.categories.map(cat => (
              <div key={cat.name} className="mb-3">
                <div className="px-4 py-1 text-xs font-semibold text-muted-foreground tracking-wider">{cat.name}</div>
                {cat.channels.map(ch => (
                  <button key={ch.id} onClick={() => selectChat(ch.id, "#" + ch.name)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg mx-1 transition-all text-left ${activeChat === ch.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                    style={{ width: "calc(100% - 8px)" }}>
                    <Icon name={ch.type === "voice" ? "Volume2" : "Hash"} size={15} className="flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{ch.name}</span>
                    {ch.unread > 0 && (
                      <span className="text-xs text-white font-bold rounded-full w-4 h-4 flex items-center justify-center"
                        style={{ background: "hsl(var(--accent-blue))", fontSize: 10 }}>
                        {ch.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))
          }
        </div>

        {/* User panel */}
        <div className="px-3 py-2 flex items-center gap-2 flex-shrink-0"
          style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(220 15% 7%)" }}>
          <div className="relative">
            <AvatarBubble label="Я" size={32} color="#6378eb" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 bg-green-400"
              style={{ borderColor: "hsl(220 15% 7%)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold">Вы</div>
            <div className="text-xs text-muted-foreground">В сети</div>
          </div>
          <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-muted transition-colors">
            <Icon name="Settings" size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ══ Chat Area ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--chan-bg))" }}>
          <button className="md:hidden" onClick={() => setMobileSidebar(m => !m)}>
            <Icon name="Menu" size={20} className="text-muted-foreground" />
          </button>
          <Icon name={isDM ? "MessageCircle" : "Hash"} size={17} className="text-muted-foreground flex-shrink-0" />
          <span className="font-semibold text-sm truncate">{activeChatName}</span>
          {isDM && (() => {
            const chat = DM_CHATS.find(c => c.id === activeChat);
            return chat ? (
              <span className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(chat.status)}`}>
                {statusLabel(chat.status)}
              </span>
            ) : null;
          })()}
          <div className="ml-auto flex items-center gap-1">
            {isDM && (
              <>
                <button onClick={() => setShowVideo(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors" title="Видеозвонок">
                  <Icon name="Video" size={17} className="text-muted-foreground" />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors" title="Звонок">
                  <Icon name="Phone" size={17} className="text-muted-foreground" />
                </button>
              </>
            )}
            <button onClick={() => setShowSearch(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
              <Icon name="Search" size={17} className="text-muted-foreground" />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
              <Icon name="Users" size={17} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-0.5"
          style={{ background: "hsl(var(--chat-bg))" }}>
          {currentMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <div className="text-5xl opacity-20">💬</div>
              <p className="text-sm">Начните разговор!</p>
            </div>
          )}

          {currentMessages.map((msg, i) => {
            const isMe = msg.isMe;
            const prev = currentMessages[i - 1];
            const grouped = prev && prev.author === msg.author;

            return (
              <div key={msg.id}
                className={`flex gap-3 group animate-message-in ${isMe ? "flex-row-reverse" : "flex-row"} ${grouped ? "mt-0.5" : "mt-4"}`}>
                {!grouped ? (
                  <div className="flex-shrink-0">
                    <AvatarBubble label={msg.avatar} size={36} color={isMe ? "#6378eb" : undefined} />
                  </div>
                ) : (
                  <div style={{ width: 36 }} className="flex-shrink-0" />
                )}

                <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                  {!grouped && (
                    <div className={`flex items-baseline gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="text-sm font-semibold"
                        style={{ color: isMe ? "hsl(var(--accent-blue))" : "hsl(var(--foreground))" }}>
                        {msg.author}
                      </span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                  )}
                  <div className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: isMe ? "hsl(var(--accent-blue))" : "hsl(var(--secondary))",
                      color: isMe ? "#fff" : "hsl(var(--foreground))",
                      borderBottomRightRadius: isMe ? 4 : 16,
                      borderBottomLeftRadius: !isMe ? 4 : 16,
                    }}>
                    {msg.text}
                  </div>
                  {msg.reactions && (
                    <div className={`flex gap-1 mt-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {msg.reactions.map(r => (
                        <button key={r.emoji}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs hover:scale-105 transition-transform"
                          style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                          <span>{r.emoji}</span>
                          <span className="text-muted-foreground">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`opacity-0 group-hover:opacity-100 flex items-center gap-0.5 self-center transition-opacity ${isMe ? "mr-1" : "ml-1"}`}>
                  {["Smile", "Reply", "MoreHorizontal"].map(icon => (
                    <button key={icon} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name={icon as "Smile"} size={13} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--chan-bg))" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}>
            <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <Icon name="Paperclip" size={18} />
            </button>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Написать ${isDM ? activeChatName : "в #" + activeChatName.replace("#", "")}...`}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="Smile" size={18} />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="Mic" size={17} />
              </button>
              <button onClick={sendMessage} disabled={!input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center ml-1 transition-all hover:scale-105 disabled:opacity-30"
                style={{ background: input.trim() ? "hsl(var(--accent-blue))" : "hsl(var(--border))" }}>
                <Icon name="Send" size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Members Panel (desktop) ══════════════════════════ */}
      <div className="hidden xl:flex flex-col flex-shrink-0"
        style={{ width: 216, background: "hsl(var(--chan-bg))", borderLeft: "1px solid hsl(var(--border))" }}>
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Участники — {ONLINE_MEMBERS.filter(m => m.status !== "offline").length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {(["online", "idle", "offline"] as const).map(status => {
            const group = ONLINE_MEMBERS.filter(m => m.status === status);
            if (!group.length) return null;
            const label = { online: "В сети", idle: "Отошли", offline: "Не в сети" }[status];
            return (
              <div key={status} className="mb-4">
                <div className="px-4 py-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  {label} — {group.length}
                </div>
                {group.map(m => (
                  <button key={m.name}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg mx-1 hover:bg-white/5 transition-colors text-left"
                    style={{ width: "calc(100% - 8px)" }}>
                    <div className="relative flex-shrink-0">
                      <AvatarBubble label={m.avatar} size={30} color={m.name === "Я" ? "#6378eb" : undefined} />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${statusColor(m.status)}`}
                        style={{ borderColor: "hsl(var(--chan-bg))" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium truncate ${m.status === "offline" ? "text-muted-foreground/60" : "text-foreground"}`}>
                        {m.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{m.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ Mobile bottom nav ════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2"
        style={{ background: "hsl(var(--srv-bg))", borderTop: "1px solid hsl(var(--border))" }}>
        {([
          { key: "chats", icon: "MessageCircle", label: "Чаты" },
          { key: "servers", icon: "Grid3X3", label: "Серверы" },
          { key: "notifications", icon: "Bell", label: "Уведомления" },
          { key: "profile", icon: "User", label: "Профиль" },
          { key: "settings", icon: "Settings", label: "Настройки" },
        ] as const).map(item => (
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`flex flex-col items-center gap-0.5 px-3 transition-colors ${tab === item.key ? "text-primary" : "text-muted-foreground"}`}>
            <Icon name={item.icon as "MessageCircle"} size={20} />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
