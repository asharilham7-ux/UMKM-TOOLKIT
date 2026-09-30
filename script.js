document.addEventListener("DOMContentLoaded", () => {
    // INISIALISASI TEMA
    const savedTheme = localStorage.getItem("umkm_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const themeToggleBtn = document.getElementById("theme-toggle");
    const settingsThemeBtn = document.getElementById("settings-theme-btn");

    function toggleTheme() {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("umkm_theme", next);
    }

    if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);
    if (settingsThemeBtn) settingsThemeBtn.addEventListener("click", toggleTheme);

    // NAVIGASI VIEW
    const navItems = document.querySelectorAll(".bottom-nav .nav-item");
    const menuCards = document.querySelectorAll(".menu-card");
    const backBtns = document.querySelectorAll(".back-btn");

    function switchView(targetId) {
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.add("active");
            window.scrollTo(0, 0);
        }
        if(targetId === "view-history") loadHistory();
    }

    menuCards.forEach(card => {
        card.addEventListener("click", () => {
            const target = card.getAttribute("data-target");
            switchView(target);
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            switchView(target);
        });
    });

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");
            const target = item.getAttribute("data-target");
            switchView(target);
        });
    });

    // FORMAT RUPIAH
    function formatRupiah(num) {
        if (isNaN(num) || num === null) return "Rp0";
        return "Rp" + Number(num).toLocaleString("id-ID");
    }

    // VALIDASI INPUT DASAR
    function getVal(id) {
        const val = parseFloat(document.getElementById(id).value);
        return isNaN(val) ? 0 : val;
    }

    function getText(id) {
        const val = document.getElementById(id).value.trim();
        return val === "" ? "Produk Tanpa Nama" : val;
    }

    // 1. KALKULATOR HPP
    const calcHppBtn = document.getElementById("calc-hpp-btn");
    const resetHppBtn = document.getElementById("reset-hpp-btn");

    if(calcHppBtn) {
        calcHppBtn.addEventListener("click", () => {
            const material = getVal("hpp-material");
            const packaging = getVal("hpp-packaging");
            const labor = getVal("hpp-labor");
            const electricity = getVal("hpp-electricity");
            const gas = getVal("hpp-gas");
            const other = getVal("hpp-other");
            const qty = getVal("hpp-qty");

            if(qty <= 0) {
                alert("Jumlah produk harus lebih dari 0.");
                return;
            }
            if(material < 0 || packaging < 0 || labor < 0 || electricity < 0 || gas < 0 || other < 0) {
                alert("Nilai tidak boleh negatif.");
                return;
            }

            const totalCost = material + packaging + labor + electricity + gas + other;
            const unitCost = totalCost / qty;

            document.getElementById("res-hpp-total").innerText = formatRupiah(totalCost);
            document.getElementById("res-hpp-unit").innerText = formatRupiah(unitCost);
            document.getElementById("result-hpp").classList.remove("hidden");
        });

        resetHppBtn.addEventListener("click", () => {
            ["hpp-name", "hpp-material", "hpp-packaging", "hpp-labor", "hpp-electricity", "hpp-gas", "hpp-other", "hpp-qty"].forEach(id => document.getElementById(id).value = "");
            document.getElementById("result-hpp").classList.add("hidden");
        });
    }

    // 2. KALKULATOR HARGA JUAL
    const calcPriceBtn = document.getElementById("calc-price-btn");
    const resetPriceBtn = document.getElementById("reset-price-btn");

    if(calcPriceBtn) {
        calcPriceBtn.addEventListener("click", () => {
            const hpp = getVal("price-hpp");
            const margin = getVal("price-margin") / 100;
            const mkt = getVal("price-mkt") / 100;
            const pay = getVal("price-pay") / 100;
            const other = getVal("price-other");

            if(hpp <= 0) {
                alert("HPP harus lebih dari 0.");
                return;
            }
            if(margin >= 1) {
                alert("Target margin harus di bawah 100%.");
                return;
            }

            // Formula: Harga Jual = (HPP + Other) / (1 - Margin - Mkt - Pay)
            const totalPercentDeduction = margin + mkt + pay;
            if(totalPercentDeduction >= 1) {
                alert("Total persentase margin dan biaya platform terlalu besar/mendekati 100%.");
                return;
            }

            const suggestPrice = (hpp + other) / (1 - totalPercentDeduction);
            const estCost = suggestPrice * (mkt + pay) + other;
            const estProfit = suggestPrice - hpp - estCost;
            const actualMargin = (estProfit / suggestPrice) * 100;

            document.getElementById("res-price-hpp").innerText = formatRupiah(hpp);
            document.getElementById("res-price-suggest").innerText = formatRupiah(suggestPrice);
            document.getElementById("res-price-cost").innerText = formatRupiah(estCost);
            document.getElementById("res-price-profit").innerText = formatRupiah(estProfit);
            document.getElementById("res-price-actual-margin").innerText = actualMargin.toFixed(2) + "%";
            document.getElementById("result-price").classList.remove("hidden");
        });

        resetPriceBtn.addEventListener("click", () => {
            ["price-name", "price-hpp", "price-margin", "price-mkt", "price-pay", "price-other"].forEach(id => document.getElementById(id).value = "");
            document.getElementById("result-price").classList.add("hidden");
        });
    }

    // 3. KALKULATOR KEUNTUNGAN
    const calcProfBtn = document.getElementById("calc-prof-btn");
    const resetProfBtn = document.getElementById("reset-prof-btn");

    if(calcProfBtn) {
        calcProfBtn.addEventListener("click", () => {
            const selling = getVal("prof-selling");
            const hpp = getVal("prof-hpp");
            const mkt = getVal("prof-mkt") / 100;
            const trans = getVal("prof-trans") / 100;
            const other = getVal("prof-other");
            const qty = getVal("prof-qty");

            if(qty <= 0) {
                alert("Jumlah produk terjual harus lebih dari 0.");
                return;
            }

            const revenue = selling * qty;
            const totalHpp = hpp * qty;
            const percentageCostPerUnit = selling * (mkt + trans) + other;
            const totalPercentageCost = percentageCostPerUnit * qty;
            const totalCost = totalHpp + totalPercentageCost;
            const netProfit = revenue - totalCost;
            const netProfitUnit = netProfit / qty;
            const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

            document.getElementById("res-prof-revenue").innerText = formatRupiah(revenue);
            document.getElementById("res-prof-totalcost").innerText = formatRupiah(totalCost);
            document.getElementById("res-prof-net").innerText = formatRupiah(netProfit);
            document.getElementById("res-prof-unit").innerText = formatRupiah(netProfitUnit);
            document.getElementById("res-prof-margin").innerText = profitMargin.toFixed(2) + "%";

            const warningBox = document.getElementById("prof-warning");
            if(selling < hpp) {
                warningBox.innerText = "Harga jual berada di bawah HPP berdasarkan data yang dimasukkan.";
                warningBox.classList.remove("hidden");
            } else {
                warningBox.classList.add("hidden");
            }

            document.getElementById("result-prof").classList.remove("hidden");
        });

        resetProfBtn.addEventListener("click", () => {
            ["prof-name", "prof-selling", "prof-hpp", "prof-mkt", "prof-trans", "prof-other", "prof-qty"].forEach(id => document.getElementById(id).value = "");
            document.getElementById("result-prof").classList.add("hidden");
        });
    }

    // 4. KALKULATOR BEP
    const calcBepBtn = document.getElementById("calc-bep-btn");
    const resetBepBtn = document.getElementById("reset-bep-btn");

    if(calcBepBtn) {
        calcBepBtn.addEventListener("click", () => {
            const fixed = getVal("bep-fixed");
            const price = getVal("bep-price");
            const variable = getVal("bep-var");
            const warningBox = document.getElementById("bep-warning");

            if(price <= variable) {
                document.getElementById("res-bep-units").innerText = "Tidak Valid";
                document.getElementById("res-bep-rupiah").innerText = "Tidak Valid";
                warningBox.innerText = "BEP tidak dapat dihitung karena harga jual tidak lebih tinggi dari biaya variabel per produk.";
                warningBox.classList.remove("hidden");
                document.getElementById("result-bep").classList.remove("hidden");
                return;
            }

            warningBox.classList.add("hidden");
            const bepUnits = Math.ceil(fixed / (price - variable));
            const bepRupiah = bepUnits * price;

            document.getElementById("res-bep-units").innerText = bepUnits + " Unit";
            document.getElementById("res-bep-rupiah").innerText = formatRupiah(bepRupiah);
            document.getElementById("result-bep").classList.remove("hidden");
        });

        resetBepBtn.addEventListener("click", () => {
            ["bep-fixed", "bep-price", "bep-var"].forEach(id => document.getElementById(id).value = "");
            document.getElementById("result-bep").classList.add("hidden");
        });
    }

    // 5. TARGET PENJUALAN
    const calcTargetBtn = document.getElementById("calc-target-btn");
    const resetTargetBtn = document.getElementById("reset-target-btn");

    if(calcTargetBtn) {
        calcTargetBtn.addEventListener("click", () => {
            const targetProfit = getVal("target-profit");
            const unitProfit = getVal("target-unit-profit");

            if(unitProfit <= 0) {
                alert("Keuntungan per produk harus lebih dari 0.");
                return;
            }

            const targetUnits = Math.ceil(targetProfit / unitProfit);
            document.getElementById("res-target-units").innerText = targetUnits + " Unit";
            document.getElementById("target-example").innerText = `Contoh: Target keuntungan ${formatRupiah(targetProfit)} dengan keuntungan per produk ${formatRupiah(unitProfit)} memerlukan minimal penjualan sebanyak ${targetUnits} produk.`;
            document.getElementById("result-target").classList.remove("hidden");
        });

        resetTargetBtn.addEventListener("click", () => {
            ["target-profit", "target-unit-profit"].forEach(id => document.getElementById(id).value = "");
            document.getElementById("result-target").classList.add("hidden");
        });
    }

    // 6. SIMULASI HARGA
    const calcSimBtn = document.getElementById("calc-sim-btn");
    const resetSimBtn = document.getElementById("reset-sim-btn");

    if(calcSimBtn) {
        calcSimBtn.addEventListener("click", () => {
            const hpp = getVal("sim-hpp");
            const pA = getVal("sim-price-a");
            const pB = getVal("sim-price-b");
            const pC = getVal("sim-price-c");

            const scenarios = [
                { name: "Skenario A", price: pA },
                { name: "Skenario B", price: pB },
                { name: "Skenario C", price: pC }
            ];

            const tbody = document.querySelector("#sim-table tbody");
            tbody.innerHTML = "";

            const metrics = [
                { label: "Harga Jual", fn: s => formatRupiah(s.price) },
                { label: "HPP", fn: s => formatRupiah(hpp) },
                { label: "Untung/Unit", fn: s => formatRupiah(s.price - hpp) },
                { label: "Margin", fn: s => s.price > 0 ? ((s.price - hpp) / s.price * 100).toFixed(1) + "%" : "0%" },
                { label: "Untung (10 Unit)", fn: s => formatRupiah((s.price - hpp) * 10) },
                { label: "Untung (50 Unit)", fn: s => formatRupiah((s.price - hpp) * 50) },
                { label: "Untung (100 Unit)", fn: s => formatRupiah((s.price - hpp) * 100) }
            ];

            metrics.forEach(m => {
                const tr = document.createElement("tr");
                let html = `<td><strong>${m.label}</strong></td>`;
                scenarios.forEach(s => {
                    html += `<td>${m.fn(s)}</td>`;
                });
                tr.innerHTML = html;
                tbody.appendChild(tr);
            });

            document.getElementById("result-sim").classList.remove("hidden");
        });

        resetSimBtn.addEventListener("click", () => {
            ["sim-hpp", "sim-price-a", "sim-price-b", "sim-price-c"].forEach(id => document.getElementById(id).value = "");
            document.getElementById("result-sim").classList.add("hidden");
        });
    }

    // 7. SIMULASI DISKON
    const calcDiscBtn = document.getElementById("calc-disc-btn");
    const resetDiscBtn = document.getElementById("reset-disc-btn");

    if(calcDiscBtn) {
        calcDiscBtn.addEventListener("click", () => {
            const normal = getVal("disc-normal");
            const discPercent = getVal("disc-percent");
            const hpp = getVal("disc-hpp");
            const other = getVal("disc-other");

            const discPrice = normal - (normal * (discPercent / 100));
            const totalCost = hpp + other;
            const profit = discPrice - totalCost;
            const margin = discPrice > 0 ? (profit / discPrice) * 100 : 0;

            document.getElementById("res-disc-price").innerText = formatRupiah(discPrice);
            document.getElementById("res-disc-profit").innerText = formatRupiah(profit);
            document.getElementById("res-disc-margin").innerText = margin.toFixed(2) + "%";

            const warningBox = document.getElementById("disc-warning");
            if(discPrice < totalCost) {
                warningBox.innerText = "Peringatan: Harga setelah diskon berada di bawah total biaya/HPP!";
                warningBox.classList.remove("hidden");
            } else {
                warningBox.classList.add("hidden");
            }

            document.getElementById("result-disc").classList.remove("hidden");
        });

        resetDiscBtn.addEventListener("click", () => {
            ["disc-normal", "disc-percent", "disc-hpp", "disc-other"].forEach(id => document.getElementById(id).value = "");
            document.getElementById("result-disc").classList.add("hidden");
        });
    }

    // COPY & WHATSAPP SHARE & SAVE HISTORY
    document.querySelectorAll(".copy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const cardId = btn.getAttribute("data-clipboard");
            const text = document.getElementById(cardId).innerText;
            navigator.clipboard.writeText(text).then(() => {
                alert("Hasil berhasil disalin ke clipboard!");
            }).catch(() => {
                alert("Gagal menyalin teks.");
            });
        });
    });

    document.querySelectorAll(".wa-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const cardId = btn.getAttribute("data-wa");
            const text = "*UMKM Profit & Pricing Toolkit*\n\n" + document.getElementById(cardId).innerText;
            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
            window.open(url, "_blank");
        });
    });

    document.querySelectorAll(".save-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.getAttribute("data-type");
            const card = btn.closest(".result-card");
            const summaryText = card.querySelector(".result-item.highlight") ? card.querySelector(".result-item.highlight").innerText : "Simulasi Bisnis";
            
            let history = JSON.parse(localStorage.getItem("umkm_history") || "[]");
            history.unshift({
                type: type,
                date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
                summary: summaryText
            });

            if(history.length > 20) history.pop(); // Max 20 riwayat
            localStorage.setItem("umkm_history", JSON.stringify(history));
            alert("Hasil berhasil disimpan ke Riwayat!");
        });
    });

    function loadHistory() {
        const listContainer = document.getElementById("history-list");
        const history = JSON.parse(localStorage.getItem("umkm_history") || "[]");

        if(history.length === 0) {
            listContainer.innerHTML = `<div class="empty-history">Belum ada riwayat tersimpan.</div>`;
            return;
        }

        let html = "";
        history.forEach((item, index) => {
            html += `
                <div class="history-item">
                    <div class="history-info">
                        <h4>${item.type}</h4>
                        <p>${item.date}</p>
                    </div>
                    <div class="history-details">${item.summary}</div>
                </div>
            `;
        });
        listContainer.innerHTML = html;
    }

    const clearHistoryBtn = document.getElementById("clear-history-btn");
    if(clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", () => {
            if(confirm("Hapus semua riwayat?")) {
                localStorage.removeItem("umkm_history");
                loadHistory();
            }
        });
    }

    const clearStorageBtn = document.getElementById("clear-storage-btn");
    if(clearStorageBtn) {
        clearStorageBtn.addEventListener("click", () => {
            if(confirm("Hapus semua data tersimpan aplikasi?")) {
                localStorage.clear();
                alert("Data berhasil dibersihkan.");
                location.reload();
            }
        });
    }
});
