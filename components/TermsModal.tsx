import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[#1a1a1a] border border-yellow-500/20 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-stone-900/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                            <FileText className="text-yellow-500" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">ข้อกำหนดและเงื่อนไขการให้บริการ</h2>
                            <p className="text-stone-400 text-xs uppercase tracking-wider">Terms of Service</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-stone-300 text-sm leading-relaxed custom-scrollbar">

                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 mb-4">
                        <p className="font-bold text-yellow-500 mb-1">อัปเดตล่าสุด: 12 กุมภาพันธ์ 2026</p>
                        <p>ยินดีต้อนรับสู่ Gold Rush ("เกม" หรือ "บริการ") กรุณาอ่านข้อกำหนดและเงื่อนไขเหล่านี้อย่างละเอียดก่อนเข้าใช้งาน การที่คุณเข้าสู่ระบบ ซื้อไอเทม หรือใช้งานส่วนใดส่วนหนึ่งของเกม ถือว่าคุณยอมรับข้อตกลงนี้โดยไม่มีเงื่อนไข</p>
                    </div>

                    <Section title="1. นิยามการให้บริการ (Service Definition)">
                        <p>Gold Rush เป็นแพลตฟอร์มเกมจำลองสถานการณ์การทำเหมือง (Simulation Game) เพื่อความบันเทิงเท่านั้น <span className="text-white font-bold">"ไม่ใช่แพลตฟอร์มการลงทุนทางการเงิน"</span> และ <span className="text-white font-bold">"ไม่ใช่เครื่องมือสร้างผลกำไรที่การันตีผลตอบแทน"</span></p>
                    </Section>

                    <Section title="2. สินทรัพย์ดิจิทัลและกรรมสิทธิ์ (Virtual Assets & Ownership)">
                        <ul className="list-disc ml-4 space-y-2">
                            <li><strong className="text-white">สิทธิ์การใช้งาน:</strong> เครื่องขุด (Mining Rigs), แร่ธาตุ (Ores), ยานพาหนะ (Vehicles), และเงินภายในเกม (In-game Currency) ถือเป็น "ข้อมูลทางคอมพิวเตอร์" ภายใต้ลิขสิทธิ์ของ Gold Rush</li>
                            <li><strong className="text-white">ไม่มีกรรมสิทธิ์ถาวร:</strong> ผู้เล่นได้รับเพียง "สิทธิ์ในการใช้งาน" (License) ภายในเซิร์ฟเวอร์ของเกมเท่านั้น ผู้เล่นไม่มีสิทธิ์เรียกร้องความเป็นเจ้าของทางกฎหมายนอกเหนือจากขอบเขตที่เกมกำหนด</li>
                            <li><strong className="text-white">การปรับสมดุล:</strong> ทีมพัฒนาขอสงวนสิทธิ์ในการปรับเปลี่ยนค่าสถานะ (Nerf/Buff), อัตราการขุด, หรือราคาตลาดของไอเทมทุกชิ้น เพื่อความสมดุลของระบบเศรษฐกิจโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>
                        </ul>
                    </Section>

                    <Section title="3. นโยบายการชำระเงินและการคืนเงิน (Payment & Refund Policy)">
                        <ul className="list-disc ml-4 space-y-2">
                            <li><strong className="text-white">ธุรกรรมสิ้นสุด:</strong> การเติมเงิน (Top-up) หรือการซื้อไอเทมด้วยเงินจริง (Fiat/Crypto) เมื่อทำรายการสำเร็จแล้ว ถือเป็นที่สิ้นสุด <strong>ไม่สามารถขอคืนเงินได้ (Non-Refundable)</strong> ในทุกกรณี</li>
                            <li><strong className="text-white">ความผิดพลาด:</strong> หากเกิดความผิดพลาดจากระบบ (เช่น ตัดเงินแล้วของไม่เข้า) ผู้เล่นต้องติดต่อทีมงานภายใน 24 ชั่วโมงพร้อมหลักฐานการโอน</li>
                        </ul>
                    </Section>

                    <Section title="4. ข้อควรระวังและความเสี่ยง (Risk Disclaimer) ⚠️">
                        <ul className="list-disc ml-4 space-y-2">
                            <li><strong className="text-white">ความผันผวนของตลาด:</strong> มูลค่าของแร่และไอเทมในเกมขึ้นอยู่กับกลไกตลาด (Demand/Supply) ของผู้เล่น ทีมงานไม่มีส่วนรับผิดชอบต่อการขาดทุนหรือกำไรที่ลดลงของผู้เล่น</li>
                            <li><strong className="text-white">ไม่ใช่คำแนะนำทางการเงิน:</strong> ข้อมูลสถิติ กราฟ หรือ ROI ที่แสดงในเกม เป็นเพียงข้อมูลประกอบการเล่นเกมเท่านั้น ไม่ถือเป็นคำแนะนำในการลงทุน</li>
                        </ul>
                    </Section>

                    <Section title="5. ข้อห้ามและการระงับบัญชี (Prohibited Conduct)">
                        <p className="mb-2">เรามีนโยบาย Zero Tolerance ต่อการโกง โดยจะระงับบัญชีถาวรทันทีหากตรวจพบ:</p>
                        <ul className="list-disc ml-4 space-y-1 text-red-300">
                            <li>การใช้โปรแกรมช่วยเล่น (Bot, Macro, Script)</li>
                            <li>การใช้ช่องโหว่ของระบบ (Bug Exploitation) เพื่อหาผลประโยชน์</li>
                            <li>การฟอกเงินหรือทำธุรกรรมที่ผิดปกติ</li>
                            <li>การซื้อขายไอดีเกมนอกระบบ (Real Money Trading of Accounts)</li>
                        </ul>
                    </Section>

                    <Section title="6. การยุติการให้บริการ (Termination of Service)">
                        <p>ทีมพัฒนาขอสงวนสิทธิ์ในการหยุดให้บริการเกมชั่วคราวหรือถาวรได้ตลอดเวลา โดยจะแจ้งล่วงหน้าตามความเหมาะสม ในกรณีที่เกมปิดให้บริการ ทีมงานไม่มีภาระผูกพันในการชดเชยค่าเสียหายหรือมูลค่าไอเทมที่เหลืออยู่</p>
                    </Section>

                    <Section title="7. กฎหมายที่บังคับใช้">
                        <p>ข้อกำหนดนี้อยู่ภายใต้บังคับของกฎหมายแห่งราชอาณาจักรไทย การระงับข้อพิพาทใดๆ ให้ดำเนินการผ่านกระบวนการทางกฎหมายในประเทศไทยเท่านั้น</p>
                    </Section>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-stone-900/50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-stone-800 hover:bg-stone-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-2">
        <h3 className="text-white font-bold text-base border-l-4 border-yellow-500 pl-3">{title}</h3>
        <div className="pl-4 text-stone-400">
            {children}
        </div>
    </div>
);
