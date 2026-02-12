import React from 'react';
import { X, Lock } from 'lucide-react';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[#1a1a1a] border border-yellow-500/20 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-stone-900/50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                            <Lock className="text-yellow-500" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">นโยบายความเป็นส่วนตัว</h2>
                            <p className="text-stone-400 text-xs uppercase tracking-wider">Privacy Policy</p>
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
                        <p>Gold Rush ("เรา") ให้ความสำคัญกับความเป็นส่วนตัวของผู้เล่น ("คุณ") นโยบายนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม, ใช้, และรักษาข้อมูลส่วนบุคคลของคุณ</p>
                    </div>

                    <Section title="1. ข้อมูลที่เราเก็บรวบรวม">
                        <p className="mb-2">เราเก็บรวบรวมข้อมูลเท่าที่จำเป็นเพื่อการให้บริการเกม ดังนี้:</p>
                        <ul className="list-disc ml-4 space-y-1">
                            <li><strong className="text-white">ข้อมูลบัญชี:</strong> ชื่อผู้ใช้ (Username), รหัสผ่าน (ที่ถูกเข้ารหัสแล้ว), และอีเมล</li>
                            <li><strong className="text-white">ข้อมูลทางการเงิน:</strong> หลักฐานการโอนเงิน (สลิป), เลขที่บัญชีบางส่วน (สำหรับการตรวจสอบ), และเลขกระเป๋าเงินดิจิทัล (Crypto Wallet Address)</li>
                            <li><strong className="text-white">ข้อมูลทางเทคนิค:</strong> หมายเลข IP Address, ชนิดของอุปกรณ์, และคุกกี้ (Cookies) เพื่อความปลอดภัยและป้องกันการโกง</li>
                        </ul>
                    </Section>

                    <Section title="2. วัตถุประสงค์การใช้ข้อมูล">
                        <p className="mb-2">เราใช้ข้อมูลของคุณเพื่อ:</p>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>ยืนยันตัวตนในการเข้าสู่ระบบและกู้คืนรหัสผ่าน</li>
                            <li>ตรวจสอบความถูกต้องของการเติมเงินและการถอนเงิน</li>
                            <li>วิเคราะห์พฤติกรรมการใช้งานเพื่อปรับปรุงระบบเกม</li>
                            <li>ป้องกันการทุจริต การใช้บอท หรือกิจกรรมที่ผิดกฎหมาย</li>
                        </ul>
                    </Section>

                    <Section title="3. การเปิดเผยข้อมูลแก่บุคคลภายนอก">
                        <p className="mb-2">เรา <strong className="text-white">ไม่จำหน่าย</strong> ข้อมูลส่วนบุคคลของคุณให้แก่บุคคลที่สาม ข้อมูลของคุณอาจถูกส่งต่อไปยังผู้ให้บริการที่จำเป็นเท่านั้น ได้แก่:</p>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>ผู้ให้บริการ Cloud Hosting และฐานข้อมูล (เพื่อเก็บรักษาข้อมูลเกม)</li>
                            <li>ผู้ให้บริการรับชำระเงิน (Payment Gateway) หรือเครือข่าย Blockchain (เพื่อประมวลผลธุรกรรม)</li>
                            <li>หน่วยงานกฎหมาย (หากมีการร้องขออย่างถูกต้องตามกฎหมาย)</li>
                        </ul>
                    </Section>

                    <Section title="4. การรักษาความปลอดภัย">
                        <p>เราใช้มาตรการความปลอดภัยมาตรฐานอุตสาหกรรม (เช่น การเข้ารหัส SSL, การ Hashing รหัสผ่าน) เพื่อป้องกันไม่ให้ข้อมูลของคุณสูญหายหรือถูกเข้าถึงโดยไม่ได้รับอนุญาต</p>
                    </Section>

                    <Section title="5. สิทธิของเจ้าของข้อมูล">
                        <p className="mb-2">ภายใต้กฎหมาย PDPA คุณมีสิทธิ์ในการ:</p>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>ขอเข้าถึงหรือขอรับสำเนาข้อมูลส่วนบุคคลของคุณ</li>
                            <li>ขอให้ลบหรือทำลายข้อมูลส่วนบุคคล (ในกรณีที่คุณต้องการเลิกเล่นถาวร)</li>
                            <li>คัดค้านการประมวลผลข้อมูลบางประการ</li>
                        </ul>
                    </Section>

                    <Section title="6. คุกกี้ (Cookies)">
                        <p>เว็บไซต์นี้ใช้คุกกี้เพื่อจดจำสถานะการล็อกอินและการตั้งค่าของคุณ การปิดการใช้งานคุกกี้อาจทำให้ฟังก์ชันบางอย่างของเกมทำงานไม่สมบูรณ์</p>
                    </Section>

                    <Section title="7. ติดต่อเรา">
                        <p className="mb-2">หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อทีมงานได้ที่:</p>
                        <ul className="list-disc ml-4 space-y-1">
                            <li>Email: support@goldrush-game.com</li>
                            <li>Discord: <a href="#" className="text-yellow-500 hover:underline">Gold Rush Official Discord</a></li>
                        </ul>
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
