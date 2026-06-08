import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COMPANY_LIST, Company } from '../data/companyList';
import { WatchlistItem } from '../types';
import { loadWatchlist, saveWatchlist } from '../utils/watchlist';
import { Colors, Spacing, Radius } from '../theme';

function SectorChip({ sector }: { sector: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{sector}</Text>
    </View>
  );
}

interface ResultRowProps {
  company: Company;
  added: boolean;
  onToggle: () => void;
}

function ResultRow({ company, added, onToggle }: ResultRowProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={styles.row}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowName} numberOfLines={1}>{company.nameZh ?? company.name}</Text>
        <Text style={styles.rowNameEn} numberOfLines={1}>{company.name}</Text>
        <Text style={styles.rowTicker}>{company.ticker} · {company.exchange}</Text>
      </View>
      <View style={styles.rowRight}>
        <SectorChip sector={company.sector} />
        <View style={[styles.toggleBtn, added && styles.toggleBtnAdded]}>
          <Text style={[styles.toggleBtnText, added && styles.toggleBtnTextAdded]}>
            {added ? '✓' : '+'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AddCompanyScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery]           = useState('');
  const [watchlist, setWatchlist]   = useState<WatchlistItem[]>([]);

  useEffect(() => { loadWatchlist().then(setWatchlist); }, []);

  const watchlistTickers = useMemo(
    () => new Set(watchlist.map(i => i.ticker)),
    [watchlist],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMPANY_LIST;
    return COMPANY_LIST.filter(
      c =>
        c.ticker.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.nameZh && c.nameZh.toLowerCase().includes(q)),
    );
  }, [query]);

  const toggleCompany = useCallback(async (company: Company) => {
    let updated: WatchlistItem[];
    if (watchlistTickers.has(company.ticker)) {
      updated = watchlist.filter(i => i.ticker !== company.ticker);
    } else {
      const item: WatchlistItem = {
        ticker:  company.ticker,
        name:    company.nameZh ? `${company.nameZh} (${company.name})` : company.name,
        sector:  company.sector,
        addedAt: new Date().toISOString(),
      };
      updated = [...watchlist, item];
    }
    setWatchlist(updated);
    await saveWatchlist(updated);
  }, [watchlist, watchlistTickers]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>添加公司</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Search input */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="搜索公司名称或股票代码"
          placeholderTextColor={Colors.textSecondary}
          autoFocus
          autoCapitalize="characters"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Results */}
      {results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>未找到相关公司</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={c => c.ticker}
          renderItem={({ item }) => (
            <ResultRow
              company={item}
              added={watchlistTickers.has(item.ticker)}
              onToggle={() => toggleCompany(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 60 },
  backText: { fontSize: 16, color: Colors.accentBlue },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 14 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    height: 44,
  },

  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  rowLeft: { flex: 1, gap: 2 },
  rowName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  rowNameEn: { fontSize: 12, color: Colors.textSecondary },
  rowTicker: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },

  chip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { fontSize: 11, color: Colors.textSecondary },

  toggleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnAdded: { backgroundColor: Colors.accentBlue },
  toggleBtnText: { fontSize: 18, color: Colors.accentBlue, lineHeight: 22 },
  toggleBtnTextAdded: { color: Colors.white, fontWeight: '700' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
