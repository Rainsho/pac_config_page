.PHONY: build package deploy clean

build:
	cd next && npm run build

package: build
	rm -rf _deploy deploy.tar.gz
	mkdir -p _deploy/next/scripts
	cp -r next/.next/standalone/next/. _deploy/next/
	cp -r next/.next/static _deploy/next/.next/
	cp -r next/public _deploy/next/
	cp next/scripts/trace-ip.ts _deploy/next/scripts/
	cp next/.env.local _deploy/next/.env
	cp next/nginx.conf _deploy/
	tar -czf deploy.tar.gz -C _deploy .
	rm -rf _deploy
	mv deploy.tar.gz deploy-$(shell date +%Y%m%d).tar.gz
	@echo "==> deploy-*.tar.gz ready ($(shell du -h deploy-*.tar.gz | cut -f1))"

clean:
	rm -rf _deploy deploy-*.tar.gz
