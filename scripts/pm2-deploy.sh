#!/usr/bin/env bash
# ============================================================
#  Cotovo PM2 Deploy Kit — Next.js 优化版
#  作者: Perimsx   QQ: 1722288011   域名: cot.wiki
#  Repo: https://github.com/Perimsx/Cotovo
# ============================================================
#  可通过环境变量覆盖配置:
#    APP_NAME, APP_PORT, APP_HOST, APP_DOMAIN
#    OWNER_NAME, OWNER_QQ, BRAND_TITLE
#    PM2_CWD, PM2_CONFIG, PKG_MANAGER
#    GIT_PULL, GIT_REMOTE, GIT_BRANCH, GIT_ALLOW_DIRTY
#    INSTALL_CMD, BUILD_CMD
#    SKIP_INSTALL, SKIP_BUILD, SKIP_STARTUP
#    CHECK_NOEXEC, COREPACK_ENABLE
#    HEALTH_CHECK, HEALTH_CHECK_HOST, HEALTH_CHECK_PATH, HEALTH_CHECK_TIMEOUT, HEALTH_CHECK_RETRIES
#    DEPLOY_BASE_DIR, DEPLOY_LOG, PM2_LOG_DIR
#    KEEP_BACKUP, MIN_DISK_MB, MIN_MEM_MB, MIN_NODE_MAJOR
# ============================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

DEPLOY_SCRIPT_VERSION="1.0.0"

APP_NAME="${APP_NAME:-cotovo-home}"
APP_PORT="${APP_PORT:-3000}"
APP_HOST="${APP_HOST:-127.0.0.1}"
APP_DOMAIN="${APP_DOMAIN:-cot.wiki}"
OWNER_NAME="${OWNER_NAME:-Perimsx}"
OWNER_QQ="${OWNER_QQ:-1722288011}"
BRAND_TITLE="${BRAND_TITLE:-Cotovo}"
PM2_CWD="${PM2_CWD:-${PROJECT_ROOT}}"
PM2_CONFIG="${PM2_CONFIG:-}"
PKG_MANAGER="${PKG_MANAGER:-auto}"
GIT_PULL="${GIT_PULL:-0}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_BRANCH="${GIT_BRANCH:-}"
GIT_ALLOW_DIRTY="${GIT_ALLOW_DIRTY:-0}"
INSTALL_CMD="${INSTALL_CMD:-}"
BUILD_CMD="${BUILD_CMD:-}"
SKIP_INSTALL="${SKIP_INSTALL:-0}"
SKIP_BUILD="${SKIP_BUILD:-0}"
SKIP_STARTUP="${SKIP_STARTUP:-0}"
CHECK_NOEXEC="${CHECK_NOEXEC:-1}"
COREPACK_ENABLE="${COREPACK_ENABLE:-1}"
HEALTH_CHECK="${HEALTH_CHECK:-1}"
HEALTH_CHECK_HOST="${HEALTH_CHECK_HOST:-}"
HEALTH_CHECK_PATH="${HEALTH_CHECK_PATH:-/}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-10}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-10}"
DEPLOY_BASE_DIR="${DEPLOY_BASE_DIR:-${PM2_CWD}/.deploy}"
DEPLOY_LOG="${DEPLOY_LOG:-}"
PM2_LOG_DIR="${PM2_LOG_DIR:-${DEPLOY_BASE_DIR}/pm2}"
KEEP_BACKUP="${KEEP_BACKUP:-0}"
MIN_DISK_MB="${MIN_DISK_MB:-1024}"
MIN_MEM_MB="${MIN_MEM_MB:-512}"
MIN_NODE_MAJOR="${MIN_NODE_MAJOR:-18}"

PKG_CMD=""
PM2_ENTRY=""
PM2_OUT_LOG=""
PM2_ERROR_LOG=""
PM2_ENTRY_ARGS=()
OS_KERNEL=""
OS_DISTRO=""
OS_ARCH=""
OS_ARCH_DISPLAY=""
OS_PKG_MGR=""
DEPLOY_START_TIME=""
_stage_start=0
_deploy_phase="初始化"
_cleanup_files=()
_had_backup=0

if [[ -t 1 ]] && [[ "${TERM:-}" != "dumb" ]]; then
  COLOR_RESET="\033[0m"
  COLOR_BLUE="\033[36m"
  COLOR_GREEN="\033[32m"
  COLOR_YELLOW="\033[33m"
  COLOR_RED="\033[31m"
  COLOR_BOLD="\033[1m"
  COLOR_DIM="\033[2m"
else
  COLOR_RESET=""
  COLOR_BLUE=""
  COLOR_GREEN=""
  COLOR_YELLOW=""
  COLOR_RED=""
  COLOR_BOLD=""
  COLOR_DIM=""
fi

_ts() { date '+%H:%M:%S'; }
log()  { printf "${COLOR_BLUE}[%s deploy]${COLOR_RESET} %s\n" "$(_ts)" "$*"; }
ok()   { printf "${COLOR_GREEN}[%s   ok ]${COLOR_RESET} %s\n" "$(_ts)" "$*"; }
warn() { printf "${COLOR_YELLOW}[%s warn ]${COLOR_RESET} %s\n" "$(_ts)" "$*"; }
err()  { printf "${COLOR_RED}[%s error]${COLOR_RESET} %s\n" "$(_ts)" "$*" >&2; }
info() { printf "${COLOR_DIM}[%s info ]${COLOR_RESET} %s\n" "$(_ts)" "$*"; }
line() { printf "%*s\n" "${1:-72}" '' | tr ' ' "${2:--}"; }

_now_sec() {
  if date '+%s' >/dev/null 2>&1; then
    date '+%s'
  else
    printf '0'
  fi
}

timer_start() { DEPLOY_START_TIME="$(_now_sec)"; }

timer_elapsed() {
  local now
  now="$(_now_sec)"
  if [[ "$DEPLOY_START_TIME" == "0" || "$now" == "0" ]]; then
    printf 'N/A'
    return 0
  fi

  local diff=$(( now - DEPLOY_START_TIME ))
  printf '%dm%ds' $(( diff / 60 )) $(( diff % 60 ))
}

stage_begin() {
  _stage_start="$(_now_sec)"
  log "$1"
}

stage_end() {
  local now
  now="$(_now_sec)"
  if [[ "$_stage_start" != "0" && "$now" != "0" ]]; then
    local diff=$(( now - _stage_start ))
    ok "$1 (耗时 ${diff}s)"
  else
    ok "$1"
  fi
}

set_phase() { _deploy_phase="$1"; }
register_cleanup() { _cleanup_files+=("$1"); }

cleanup() {
  local file
  for file in "${_cleanup_files[@]:-}"; do
    [[ -n "$file" && -f "$file" ]] && rm -f "$file" 2>/dev/null || true
  done
}

make_temp_file() {
  local tmp=''
  if tmp="$(mktemp 2>/dev/null)"; then
    printf '%s' "$tmp"
    return 0
  fi

  tmp="${TMPDIR:-/tmp}/cotovo-deploy.$$.log"
  : > "$tmp"
  printf '%s' "$tmp"
}

run_shell_command() {
  bash -lc "$1"
}

rollback_build_output() {
  if [[ "$_had_backup" != "1" || ! -d ".next.bak" ]]; then
    return 0
  fi

  warn "检测到 .next.bak，尝试回滚到上一版构建产物..."
  rm -rf .next 2>/dev/null || true
  if mv .next.bak .next 2>/dev/null; then
    ok "已回滚 .next 到上一个版本"
    if command -v pm2 >/dev/null 2>&1; then
      warn "尝试使用旧构建重载 PM2..."
      resolve_pm2_runtime >/dev/null 2>&1 || true
      pm2_start_or_reload >/dev/null 2>&1 && ok "PM2 已切回旧版本" || warn "PM2 回滚重载失败，请手动检查"
    fi
  else
    err "构建产物回滚失败，请手动恢复 .next"
  fi
}

on_error() {
  local exit_code=$?
  err "═══════════════════════════════════════════════════════"
  err "  部署失败！失败阶段: ${_deploy_phase}"
  err "  退出码: ${exit_code}"
  if [[ -n "$DEPLOY_LOG" ]]; then
    err "  部署日志: ${DEPLOY_LOG}"
  fi
  err "═══════════════════════════════════════════════════════"
  rollback_build_output
  cleanup
  exit "$exit_code"
}

trap on_error ERR
trap cleanup EXIT

setup_deploy_log() {
  mkdir -p "${DEPLOY_BASE_DIR}/logs" 2>/dev/null || true
  if [[ -z "$DEPLOY_LOG" ]]; then
    DEPLOY_LOG="${DEPLOY_BASE_DIR}/logs/deploy-$(date '+%Y%m%d-%H%M%S').log"
  fi
  mkdir -p "$(dirname "$DEPLOY_LOG")" 2>/dev/null || true
  exec > >(tee -a "$DEPLOY_LOG") 2>&1
  info "部署日志输出到: ${DEPLOY_LOG}"
}

detect_os() {
  local kernel distro arch pkg_mgr

  kernel="$(uname -s 2>/dev/null || echo 'Unknown')"
  arch="$(uname -m 2>/dev/null || echo 'unknown')"
  distro="Unknown"
  pkg_mgr="unknown"

  case "$kernel" in
    Linux)
      if grep -qiE '(microsoft|wsl)' /proc/version 2>/dev/null; then
        kernel="Linux (WSL)"
      fi
      if [[ -f /etc/os-release ]]; then
        # shellcheck disable=SC1091
        source /etc/os-release 2>/dev/null || true
        distro="${PRETTY_NAME:-${NAME:-Unknown}}"
        case "${ID:-}" in
          ubuntu|debian|linuxmint|pop) pkg_mgr="apt" ;;
          centos|rhel|rocky|almalinux|ol) pkg_mgr="yum" ;;
          fedora) pkg_mgr="dnf" ;;
          arch|manjaro|endeavouros) pkg_mgr="pacman" ;;
          alpine) pkg_mgr="apk" ;;
          opensuse*|sles) pkg_mgr="zypper" ;;
        esac
      fi
      ;;
    Darwin)
      distro="macOS $(sw_vers -productVersion 2>/dev/null || echo '?')"
      pkg_mgr="brew"
      ;;
    MINGW*|MSYS*|CYGWIN*)
      distro="Windows (${kernel})"
      pkg_mgr="N/A"
      ;;
  esac

  case "$arch" in
    x86_64|amd64) arch="amd64"; OS_ARCH_DISPLAY="x86_64 (amd64)" ;;
    aarch64|arm64) arch="arm64"; OS_ARCH_DISPLAY="aarch64 (arm64)" ;;
    armv7l|armv7) arch="arm"; OS_ARCH_DISPLAY="armv7l (32-bit ARM)" ;;
    i686|i386) arch="x86"; OS_ARCH_DISPLAY="x86 (32-bit)" ;;
    *) OS_ARCH_DISPLAY="$arch" ;;
  esac

  OS_KERNEL="$kernel"
  OS_DISTRO="$distro"
  OS_ARCH="$arch"
  OS_PKG_MGR="$pkg_mgr"

  info "操作系统: ${OS_KERNEL}"
  info "发行版  : ${OS_DISTRO}"
  info "CPU 架构: ${OS_ARCH_DISPLAY}"
  info "包管理器: ${OS_PKG_MGR}"
}

install_hint() {
  local tool="$1"
  case "$OS_PKG_MGR" in
    apt) printf 'sudo apt update && sudo apt install -y %s' "$tool" ;;
    yum) printf 'sudo yum install -y %s' "$tool" ;;
    dnf) printf 'sudo dnf install -y %s' "$tool" ;;
    pacman) printf 'sudo pacman -Sy --noconfirm %s' "$tool" ;;
    apk) printf 'sudo apk add %s' "$tool" ;;
    zypper) printf 'sudo zypper install -y %s' "$tool" ;;
    brew) printf 'brew install %s' "$tool" ;;
    *) printf '请手动安装 %s' "$tool" ;;
  esac
}

validate_port() {
  if ! [[ "$APP_PORT" =~ ^[0-9]+$ ]]; then
    err "APP_PORT 必须是数字，当前值: ${APP_PORT}"
    exit 1
  fi

  if (( APP_PORT < 1 || APP_PORT > 65535 )); then
    err "APP_PORT 超出范围 (1-65535): ${APP_PORT}"
    exit 1
  fi
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "$2"
    exit 1
  fi
}

detect_package_manager() {
  if [[ "$PKG_MANAGER" == "auto" ]]; then
    if [[ -f "pnpm-lock.yaml" ]]; then
      PKG_MANAGER="pnpm"
    elif [[ -f "package-lock.json" ]]; then
      PKG_MANAGER="npm"
    elif [[ -f "yarn.lock" ]]; then
      PKG_MANAGER="yarn"
    else
      PKG_MANAGER="npm"
    fi
  fi

  case "$PKG_MANAGER" in
    npm)
      PKG_CMD="npm"
      if [[ -z "$INSTALL_CMD" ]]; then
        if [[ -f "package-lock.json" ]]; then
          INSTALL_CMD="npm ci"
        else
          INSTALL_CMD="npm install"
        fi
      fi
      [[ -z "$BUILD_CMD" ]] && BUILD_CMD="npm run build"
      ;;
    pnpm)
      PKG_CMD="pnpm"
      [[ -z "$INSTALL_CMD" ]] && INSTALL_CMD="pnpm install --frozen-lockfile"
      [[ -z "$BUILD_CMD" ]] && BUILD_CMD="pnpm build"
      ;;
    yarn)
      PKG_CMD="yarn"
      [[ -z "$INSTALL_CMD" ]] && INSTALL_CMD="yarn install --frozen-lockfile"
      [[ -z "$BUILD_CMD" ]] && BUILD_CMD="yarn build"
      ;;
    *)
      err "不支持的包管理器: ${PKG_MANAGER}"
      exit 1
      ;;
  esac

  info "依赖管理器: ${PKG_MANAGER}"
}

check_node_version() {
  local node_ver major
  node_ver="$(node -v 2>/dev/null || echo 'unknown')"
  major="$(node -p "parseInt(process.versions.node.split('.')[0], 10)" 2>/dev/null || echo '0')"
  if ! [[ "$major" =~ ^[0-9]+$ ]] || (( major < MIN_NODE_MAJOR )); then
    err "Node.js 版本过低: ${node_ver} (需要 >= ${MIN_NODE_MAJOR})"
    err "安装提示: $(install_hint nodejs)"
    exit 1
  fi

  info "Node.js: ${node_ver} ✓"
}

check_pkg_manager_version() {
  local version
  version="$("$PKG_CMD" --version 2>/dev/null || echo 'unknown')"
  info "${PKG_MANAGER}: v${version}"
}

resolve_health_check_host() {
  if [[ -n "$HEALTH_CHECK_HOST" ]]; then
    printf '%s' "$HEALTH_CHECK_HOST"
    return 0
  fi

  if [[ -z "$APP_HOST" || "$APP_HOST" == "0.0.0.0" || "$APP_HOST" == "::" || "$APP_HOST" == "[::]" || "$APP_HOST" == "::0" ]]; then
    printf '127.0.0.1'
    return 0
  fi

  printf '%s' "$APP_HOST"
}

format_http_host() {
  local host="$1"
  if [[ "$host" == *:* && "$host" != \[*\] ]]; then
    printf '[%s]' "$host"
    return 0
  fi

  printf '%s' "$host"
}

git_pull_latest() {
  if [[ "$GIT_PULL" != "1" ]]; then
    return 0
  fi

  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    err "当前目录不是 Git 仓库，无法执行 GitHub 拉取"
    return 1
  fi

  if [[ -z "$GIT_BRANCH" ]]; then
    GIT_BRANCH="$(git branch --show-current 2>/dev/null || true)"
  fi

  if [[ -z "$GIT_BRANCH" || "$GIT_BRANCH" == "HEAD" ]]; then
    err "无法自动识别当前分支，请显式设置 GIT_BRANCH"
    return 1
  fi

  if [[ "$GIT_ALLOW_DIRTY" != "1" ]] && [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    err "检测到 Git 工作区存在未提交改动，已阻止自动拉取以避免混合部署"
    err "如确认要继续，可先提交/清理改动，或显式设置 GIT_ALLOW_DIRTY=1"
    return 1
  fi

  stage_begin "拉取 GitHub 最新代码..."
  info "Git 远端/分支: ${GIT_REMOTE}/${GIT_BRANCH}"
  git fetch "$GIT_REMOTE" "$GIT_BRANCH" --tags
  git pull --ff-only "$GIT_REMOTE" "$GIT_BRANCH"
  stage_end "GitHub 代码拉取完成"
}

resolve_pm2_runtime() {
  local standalone_entry next_entry

  PM2_OUT_LOG="${PM2_LOG_DIR}/${APP_NAME}-out.log"
  PM2_ERROR_LOG="${PM2_LOG_DIR}/${APP_NAME}-error.log"
  standalone_entry="${PM2_CWD}/.next/standalone/server.js"
  next_entry="${PM2_CWD}/node_modules/next/dist/bin/next"

  if [[ -n "$PM2_CONFIG" && -f "$PM2_CONFIG" ]]; then
    info "PM2 启动模式: ecosystem (${PM2_CONFIG})"
    return 0
  fi

  if [[ -f "$standalone_entry" ]]; then
    PM2_ENTRY="$standalone_entry"
    PM2_ENTRY_ARGS=()
    info "PM2 启动模式: standalone server.js"
    return 0
  fi

  if [[ -f "$next_entry" ]]; then
    PM2_ENTRY="$next_entry"
    PM2_ENTRY_ARGS=("start" "-p" "$APP_PORT" "-H" "$APP_HOST")
    info "PM2 启动模式: next start"
    return 0
  fi

  err "未找到 PM2 可执行入口"
  err "期望存在: ${standalone_entry} 或 ${next_entry}"
  return 1
}

pm2_app_exists() {
  pm2 describe "$APP_NAME" >/dev/null 2>&1
}

pm2_start_direct() {
  local cmd
  cmd=(
    pm2 start "$PM2_ENTRY"
    --name "$APP_NAME"
    --cwd "$PM2_CWD"
    --interpreter node
    --update-env
    --output "$PM2_OUT_LOG"
    --error "$PM2_ERROR_LOG"
    --merge-logs
    --time
  )

  if [[ ${#PM2_ENTRY_ARGS[@]} -gt 0 ]]; then
    cmd+=(-- "${PM2_ENTRY_ARGS[@]}")
  fi

  "${cmd[@]}"
}

pm2_start_or_reload() {
  if [[ -n "$PM2_CONFIG" && -f "$PM2_CONFIG" ]]; then
    pm2 startOrReload "$PM2_CONFIG" --update-env
    return 0
  fi

  if pm2_app_exists; then
    warn "检测到已存在的 PM2 应用，重新创建以更新启动参数..."
    pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  fi

  pm2_start_direct
}

check_noexec_mount() {
  if [[ "$CHECK_NOEXEC" != "1" ]]; then
    return 0
  fi

  if ! command -v findmnt >/dev/null 2>&1; then
    warn "findmnt 未找到，跳过 noexec 挂载检查"
    return 0
  fi

  local mount_opts mount_target
  mount_opts="$(findmnt -no OPTIONS -T "$PM2_CWD" 2>/dev/null || true)"
  mount_target="$(findmnt -no TARGET -T "$PM2_CWD" 2>/dev/null || true)"
  if [[ -n "$mount_opts" && "$mount_opts" == *noexec* ]]; then
    err "检测到 noexec 挂载点: ${mount_target:-unknown} (${mount_opts})"
    err "修复: mount -o remount,exec ${mount_target:-<mountpoint>}"
    exit 1
  fi
}

check_disk_space() {
  local avail_kb
  avail_kb="$(df -Pk "$PM2_CWD" 2>/dev/null | awk 'NR==2 {print $4}' || echo '0')"
  if [[ "$avail_kb" =~ ^[0-9]+$ ]] && (( avail_kb > 0 )); then
    local avail_mb=$(( avail_kb / 1024 ))
    if (( avail_mb < MIN_DISK_MB )); then
      err "磁盘可用空间不足: ${avail_mb}MB (最低要求: ${MIN_DISK_MB}MB)"
      exit 1
    fi
    info "磁盘可用空间: ${avail_mb}MB ✓"
  else
    warn "无法检测磁盘可用空间，跳过检查"
  fi
}

check_memory() {
  local avail_mb=0
  if [[ -f /proc/meminfo ]]; then
    avail_mb="$(awk '/^MemAvailable:/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo '0')"
    if [[ "$avail_mb" == "0" ]]; then
      avail_mb="$(awk '/^MemFree:/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo '0')"
    fi
  elif command -v sysctl >/dev/null 2>&1; then
    local page_size free_pages
    page_size="$(sysctl -n hw.pagesize 2>/dev/null || echo '4096')"
    free_pages="$(vm_stat 2>/dev/null | awk '/Pages free/ {gsub(/\./,""); print $3}' || echo '0')"
    if [[ "$free_pages" =~ ^[0-9]+$ ]]; then
      avail_mb=$(( free_pages * page_size / 1024 / 1024 ))
    fi
  fi

  if (( avail_mb > 0 )); then
    if (( avail_mb < MIN_MEM_MB )); then
      warn "可用内存较低: ${avail_mb}MB (建议 >= ${MIN_MEM_MB}MB)"
    else
      info "可用内存: ${avail_mb}MB ✓"
    fi
  else
    warn "无法检测可用内存，跳过检查"
  fi
}

check_ulimits() {
  local open_files
  open_files="$(ulimit -n 2>/dev/null || echo '0')"
  if [[ "$open_files" =~ ^[0-9]+$ ]] && (( open_files > 0 && open_files < 1024 )); then
    warn "当前 open files 限制较低: ${open_files} (建议 >= 1024)"
  elif [[ "$open_files" =~ ^[0-9]+$ ]] && (( open_files > 0 )); then
    info "open files 限制: ${open_files} ✓"
  fi
}

check_port_conflict() {
  local existing_pm2_pid conflict_pid
  existing_pm2_pid=""
  conflict_pid=""

  if command -v pm2 >/dev/null 2>&1; then
    existing_pm2_pid="$(pm2 pid "$APP_NAME" 2>/dev/null | head -1 || echo '')"
  fi

  if command -v ss >/dev/null 2>&1; then
    conflict_pid="$(ss -tlnp "sport = :${APP_PORT}" 2>/dev/null | awk 'NR>1 {if (match($0, /pid=([0-9]+)/, arr)) print arr[1]}' | head -1 || echo '')"
  elif command -v lsof >/dev/null 2>&1; then
    conflict_pid="$(lsof -ti ":${APP_PORT}" -sTCP:LISTEN 2>/dev/null | head -1 || echo '')"
  elif command -v netstat >/dev/null 2>&1; then
    conflict_pid="$(netstat -tlnp 2>/dev/null | awk -v port=":${APP_PORT}" '$4 ~ port {split($7,a,"/"); print a[1]}' | head -1 || echo '')"
  else
    warn "未找到 ss/lsof/netstat，跳过端口占用检查"
    return 0
  fi

  if [[ -n "$conflict_pid" && "$conflict_pid" != "0" ]]; then
    if [[ -n "$existing_pm2_pid" && "$conflict_pid" == "$existing_pm2_pid" ]]; then
      info "端口 ${APP_PORT} 当前由 PM2 实例占用，重载时会自动替换 ✓"
      return 0
    fi

    local proc_name
    proc_name="$(ps -p "$conflict_pid" -o comm= 2>/dev/null || echo 'unknown')"
    err "端口 ${APP_PORT} 已被占用"
    err "  PID: ${conflict_pid}  进程: ${proc_name}"
    exit 1
  fi

  info "端口 ${APP_PORT} 可用 ✓"
}

backup_build_output() {
  if [[ -d ".next" ]]; then
    log "备份现有 .next 目录..."
    rm -rf .next.bak 2>/dev/null || true
    if cp -a .next .next.bak 2>/dev/null; then
      _had_backup=1
      ok "已备份 .next -> .next.bak"
    else
      warn "备份 .next 失败，后续将无法自动回滚"
    fi
  fi
}

cleanup_backup() {
  if [[ "$KEEP_BACKUP" == "1" ]]; then
    info "保留 .next.bak 备份 (KEEP_BACKUP=1)"
    return 0
  fi

  if [[ -d ".next.bak" ]]; then
    rm -rf .next.bak 2>/dev/null || true
    info "已清理 .next.bak 备份"
  fi
}

validate_build_output() {
  if [[ -f ".next/BUILD_ID" ]]; then
    info "检测到 Next 标准构建产物 (.next/BUILD_ID) ✓"
    return 0
  fi

  if [[ -f ".next/standalone/server.js" ]]; then
    info "检测到 Next standalone 构建产物 (.next/standalone/server.js) ✓"
    return 0
  fi

  err "缺少可识别的 Next 构建产物，未找到 .next/BUILD_ID 或 .next/standalone/server.js"
  return 1
}

health_check() {
  if [[ "$HEALTH_CHECK" != "1" ]]; then
    info "跳过健康检查 (HEALTH_CHECK=0)"
    return 0
  fi

  log "执行 PM2 健康检查..."

  local retries=0
  local status=""
  while (( retries < HEALTH_CHECK_RETRIES )); do
    sleep 2
    status="$(pm2 jlist 2>/dev/null | node -e "
      let data='';
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => {
        try {
          const apps = JSON.parse(data);
          const app = apps.find(item => item.name === '${APP_NAME}');
          console.log(app ? app.pm2_env.status : 'not_found');
        } catch (error) {
          console.log('parse_error');
        }
      });
    " 2>/dev/null || echo 'check_failed')"

    if [[ "$status" == "online" ]]; then
      ok "PM2 进程状态: online ✓"
      break
    fi

    retries=$(( retries + 1 ))
    if (( retries < HEALTH_CHECK_RETRIES )); then
      info "等待 PM2 进程进入 online (${retries}/${HEALTH_CHECK_RETRIES})... 当前状态: ${status}"
    fi
  done

  if [[ "$status" != "online" ]]; then
    err "PM2 进程未能进入 online 状态，最终状态: ${status}"
    return 1
  fi

  local connect_host health_url
  connect_host="$(resolve_health_check_host)"
  health_url="http://$(format_http_host "$connect_host"):${APP_PORT}${HEALTH_CHECK_PATH}"
  if command -v curl >/dev/null 2>&1; then
    log "执行 HTTP 健康检查: ${health_url}"
    local http_retries=0
    local http_code="000"
    while (( http_retries < HEALTH_CHECK_RETRIES )); do
      http_code="$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time "$HEALTH_CHECK_TIMEOUT" "$health_url" 2>/dev/null || echo '000')"
      if [[ "$http_code" =~ ^[23] ]]; then
        ok "HTTP 健康检查通过 (status: ${http_code}) ✓"
        return 0
      fi

      http_retries=$(( http_retries + 1 ))
      if (( http_retries < HEALTH_CHECK_RETRIES )); then
        info "HTTP 检查重试 (${http_retries}/${HEALTH_CHECK_RETRIES})... status: ${http_code}"
        sleep 2
      fi
    done

    warn "HTTP 健康检查未通过，最终 status: ${http_code}"
    return 1
  fi

  if command -v wget >/dev/null 2>&1; then
    log "执行 HTTP 健康检查 (wget): ${health_url}"
    if wget -q --spider --timeout="$HEALTH_CHECK_TIMEOUT" "$health_url" 2>/dev/null; then
      ok "HTTP 健康检查通过 ✓"
      return 0
    fi
    warn "HTTP 健康检查未通过"
    return 1
  fi

  warn "未找到 curl/wget，跳过 HTTP 检查"
  return 0
}

setup_pm2_startup() {
  if [[ "$SKIP_STARTUP" == "1" ]]; then
    warn "跳过 PM2 开机自启配置 (SKIP_STARTUP=1)"
    return 0
  fi

  log "配置 PM2 开机自启..."
  local startup_log
  startup_log="$(make_temp_file)"
  register_cleanup "$startup_log"

  if pm2 startup >"$startup_log" 2>&1; then
    ok "PM2 startup 配置成功"
    rm -f "$startup_log" 2>/dev/null || true
    return 0
  fi

  if [[ "$(id -u 2>/dev/null || echo '1000')" != "0" ]]; then
    local sudo_cmd
    sudo_cmd="$(grep -oE 'sudo .*$' "$startup_log" 2>/dev/null | head -1 || echo '')"
    warn "PM2 startup 需要 root 权限"
    if [[ -n "$sudo_cmd" ]]; then
      printf "  %b%s%b\n" "$COLOR_BOLD" "$sudo_cmd" "$COLOR_RESET"
    else
      cat "$startup_log"
    fi
  else
    warn "PM2 startup 配置失败，请检查输出:"
    cat "$startup_log"
  fi

  rm -f "$startup_log" 2>/dev/null || true
}

print_banner() {
  local sep
  sep="$(line 74 '=')"
  printf "\n${COLOR_BLUE}%s${COLOR_RESET}\n" "$sep"
  cat <<'EOF'
   ______      __
  / ____/___  / /_____ _   ______
 / /   / __ \/ __/ __ \ | / / __ \
/ /___/ /_/ / /_/ /_/ / |/ / /_/ /
\____/\____/\__/\____/|___/\____/
EOF
  printf "${COLOR_BLUE}%s${COLOR_RESET}\n" "$sep"
  printf "  Brand : %s\n" "$BRAND_TITLE"
  printf "  Owner : %s\n" "$OWNER_NAME"
  printf "  QQ    : %s\n" "$OWNER_QQ"
  printf "  Domain: %s\n" "$APP_DOMAIN"
  printf "  Script: v%s\n\n" "$DEPLOY_SCRIPT_VERSION"
}

main() {
  timer_start
  print_banner

  set_phase "操作系统检测"
  detect_os
  printf "\n"

  set_phase "端口校验"
  validate_port

  set_phase "工作目录验证"
  if [[ ! -d "$PM2_CWD" ]]; then
    err "PM2_CWD 目录不存在: ${PM2_CWD}"
    exit 1
  fi
  cd "$PM2_CWD"

  if [[ ! -f package.json ]]; then
    err "当前目录不是 Node 项目根目录 (缺少 package.json): ${PM2_CWD}"
    exit 1
  fi

  set_phase "依赖工具检查"
  require_cmd node "Node.js 未找到。安装: $(install_hint nodejs)"
  require_cmd pm2 "pm2 未找到。安装: npm i -g pm2"
  if [[ "$GIT_PULL" == "1" ]]; then
    require_cmd git "git 未找到，请先安装 git"
  fi

  set_phase "Node 版本校验"
  check_node_version

  set_phase "日志初始化"
  setup_deploy_log

  set_phase "包管理器版本校验"
  check_pkg_manager_version

  set_phase "corepack 检查"
  if [[ "$COREPACK_ENABLE" == "1" ]] && command -v corepack >/dev/null 2>&1; then
    log "启用 corepack..."
    corepack enable >/dev/null 2>&1 || true
  else
    info "跳过 corepack 处理"
  fi

  set_phase "GitHub 拉取"
  git_pull_latest

  detect_package_manager
  require_cmd "$PKG_CMD" "${PKG_MANAGER} 未找到，请先安装对应包管理器"

  set_phase "系统资源预检"
  line 72 '─'
  log "系统资源预检..."
  check_noexec_mount
  check_disk_space
  check_memory
  check_ulimits
  check_port_conflict
  ok "系统预检完成"

  printf "\n"
  line 72 '─'
  log "部署配置:"
  info "  工作目录  : ${PM2_CWD}"
  info "  监听地址  : ${APP_HOST}:${APP_PORT}"
  info "  应用名称  : ${APP_NAME}"
  info "  PM2 配置  : ${PM2_CONFIG}"
  info "  包管理器  : ${PKG_MANAGER}"
  info "  Git 拉取  : $([[ "$GIT_PULL" == "1" ]] && printf 'enabled' || printf 'disabled')"
  info "  健康检查  : http://$(format_http_host "$(resolve_health_check_host)"):${APP_PORT}${HEALTH_CHECK_PATH}"
  info "  安装命令  : ${INSTALL_CMD}"
  info "  构建命令  : ${BUILD_CMD}"
  info "  PM2 日志  : ${PM2_LOG_DIR}"
  line 72 '─'
  printf "\n"

  set_phase "依赖安装"
  if [[ "$SKIP_INSTALL" == "1" ]]; then
    warn "跳过依赖安装 (SKIP_INSTALL=1)"
  else
    stage_begin "安装依赖..."
    run_shell_command "$INSTALL_CMD"
    stage_end "依赖安装完成"
  fi

  set_phase "项目构建"
  if [[ "$SKIP_BUILD" == "1" ]]; then
    warn "跳过构建 (SKIP_BUILD=1)"
  else
    backup_build_output
    stage_begin "构建生产产物..."
    run_shell_command "$BUILD_CMD"
    stage_end "构建完成"
  fi

  set_phase "构建产物验证"
  validate_build_output

  local output_size
  output_size="$(du -sm .next 2>/dev/null | awk '{print $1}' || echo '0')"
  if [[ "$output_size" =~ ^[0-9]+$ ]] && (( output_size > 0 )); then
    info "构建产物大小: ${output_size}MB ✓"
  else
    warn "无法检测 .next 目录大小"
  fi

  set_phase "PM2 启动准备"
  mkdir -p "$DEPLOY_BASE_DIR" "$PM2_LOG_DIR"

  export APP_NAME
  export APP_PORT
  export APP_HOST
  export APP_DOMAIN
  export PORT="$APP_PORT"
  export HOSTNAME="$APP_HOST"
  export PM2_APP_NAME="$APP_NAME"
  export PM2_CWD
  export PM2_LOG_DIR
  export NODE_ENV=production
  export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-1}"
  if [[ -z "${NEXT_PUBLIC_SITE_URL:-}" && -n "$APP_DOMAIN" ]]; then
    export NEXT_PUBLIC_SITE_URL="https://${APP_DOMAIN}"
  fi
  resolve_pm2_runtime

  set_phase "PM2 启动"
  stage_begin "启动/重载 PM2 应用..."
  pm2_start_or_reload
  stage_end "PM2 启动/重载 ${APP_NAME}"

  log "保存 PM2 进程列表..."
  pm2 save
  ok "PM2 进程列表已保存"

  set_phase "健康检查"
  health_check

  set_phase "PM2 开机自启"
  setup_pm2_startup

  set_phase "清理"
  cleanup_backup

  local total_time
  total_time="$(timer_elapsed)"
  printf "\n"
  line 72 '='
  printf "${COLOR_GREEN}${COLOR_BOLD}  ✅ 部署完成${COLOR_RESET}\n"
  line 72 '='
  printf "  应用名称 : %s\n" "$APP_NAME"
  printf "  访问地址 : http://%s:%s\n" "$APP_HOST" "$APP_PORT"
  printf "  域名     : %s\n" "$APP_DOMAIN"
  printf "  部署耗时 : %s\n" "$total_time"
  printf "  部署日志 : %s\n" "$DEPLOY_LOG"
  printf "\n"
  printf "  常用命令:\n"
  printf "    ${COLOR_DIM}pm2 status${COLOR_RESET}              — 查看进程状态\n"
  printf "    ${COLOR_DIM}pm2 logs %s${COLOR_RESET}    — 查看应用日志\n" "$APP_NAME"
  printf "    ${COLOR_DIM}pm2 restart %s${COLOR_RESET} — 重启应用\n" "$APP_NAME"
  printf "    ${COLOR_DIM}pm2 monit${COLOR_RESET}               — 打开监控面板\n"
  line 72 '='
  printf "\n"
}

main "$@"
