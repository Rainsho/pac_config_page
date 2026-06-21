.PHONY: build package upload

build:
	pnpm build

package: build
	rm -rf _deploy deploy-*.tar.gz
	mkdir -p _deploy/pac/.next
	cp -R .next/standalone/. _deploy/pac/
	cp -R .next/static _deploy/pac/.next/
	cp -R public _deploy/pac/
	cp .env.local _deploy/pac/.env
	tar -czf deploy-$(shell date +%Y%m%d%H%M).tar.gz -C _deploy .
	rm -rf _deploy
	@echo "==> deploy-*.tar.gz ready ($$(du -h deploy-*.tar.gz | cut -f1))"

upload:
	$(eval TAR := $(shell ls -t deploy-*.tar.gz 2>/dev/null | head -1))
	@test -n "$(TAR)" || (echo "No tar.gz found, run 'make package' first" && exit 1)
	scp $(TAR) nexus:app/pac/
