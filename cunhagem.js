(function () {
    if (!location.href.includes('screen=snob')) {
        UI.InfoMessage("Abra a tela de cunhagem (snob) para usar o script.", 3000, "error");
        return;
    }

    if (window.mintScriptRunning) {
        UI.InfoMessage("O script já está em execução.", 3000, "warning");
        return;
    }

    window.mintScriptRunning = false;
    let contadorId = null;
    let segundosRestantes = 0;

    const html = `
        <div id="conteudoCunhagem">
            <div style="margin-bottom:10px;">
                <label><b>⛁ Cunhagem Automática</b></label><br><br>
                <label>Intervalo (segundos): </label>
                <select id="intervaloCunhagem" class="vis">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                    <option value="60">60</option>
                    <option value="120">120 (2 min)</option>
                    <option value="300">300 (5 min)</option>
                    <option value="600">600 (10 min)</option>
                    <option value="1800">1800 (30 min)</option>
                    <option value="3600">3600 (1 hora)</option>
                </select>
            </div>
            <div style="margin-bottom:8px;">
                <span id="contadorTempo" style="font-weight:bold;display:block;">Próximo em: -</span>
            </div>
            <div>
                <button id="iniciarCunhagem" class="btn btn-confirm-yes">Iniciar</button>
                <button id="pararCunhagem" class="btn btn-confirm-no" disabled>Parar</button>
            </div>
        </div>
    `;

    Dialog.show("cunhagem_auto", html);

    function executarCunhagem() {
        // Preenche todos os selects com o MAIOR valor possível
        document.querySelectorAll('select.coin_amount').forEach(select => {
            const opcoesValidas = [...select.options]
                .map(opt => parseInt(opt.value, 10))
                .filter(v => !isNaN(v) && v > 0);

            if (opcoesValidas.length > 0) {
                const maiorValor = Math.max(...opcoesValidas);
                select.value = maiorValor.toString();
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        console.log("[Cunhagem] Selecionando aldeias...");
        document.querySelector('#select_anchor_top')?.click();

        setTimeout(() => {
            console.log("[Cunhagem] Cunhando moedas...");
            document.querySelector('.mint_multi_button')?.click();
        }, 1000);
    }

    function atualizarContador() {
        $('#contadorTempo').text(`Próximo em: ${segundosRestantes}s`);
        segundosRestantes--;
        if (segundosRestantes < 0) {
            segundosRestantes = parseInt($('#intervaloCunhagem').val(), 10);
            executarCunhagem();
        }
    }

    $(document).on('click', '#iniciarCunhagem', function () {
        if (window.mintScriptRunning) return;

        const delaySegundos = parseInt($('#intervaloCunhagem').val(), 10);
        segundosRestantes = delaySegundos;
        window.mintScriptRunning = true;

        $('#iniciarCunhagem').attr('disabled', true);
        $('#pararCunhagem').attr('disabled', false);

        executarCunhagem();
        contadorId = setInterval(atualizarContador, 1000);
    });

    $(document).on('click', '#pararCunhagem', function () {
        if (!window.mintScriptRunning) return;

        clearInterval(contadorId);
        window.mintScriptRunning = false;
        $('#contadorTempo').text('Próximo em: -');
        $('#iniciarCunhagem').attr('disabled', false);
        $('#pararCunhagem').attr('disabled', true);
        console.log("[Cunhagem] Script parado.");
    });
})();
