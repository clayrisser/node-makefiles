PLATFORM := $(shell node -e "process.stdout.write(process.platform)")

ifeq ($(PLATFORM), win32)
	MAKE = make
	NULL := nul
	SHELL = cmd.exe
else
	NULL := /dev/null
  SHELL := $(shell bash --version >$(NULL) 2>&1 && echo bash|| echo sh)
endif

CD := cd
GIT := $(shell git --version >$(NULL) 2>&1 && echo git|| echo true)
NPM := $(shell pnpm --version >$(NULL) 2>&1 && echo pnpm|| (yarn --version >$(NULL) 2>&1 && echo yarn|| echo npm))
NOFAIL := 2>$(NULL)|| true

.EXPORT_ALL_VARIABLES:

DONE := node_modules/.make
define done
mkdir -p $(DONE) && touch -m $(DONE)/$1
endef
